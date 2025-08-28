import {BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {OutboxService} from '@nlc-ai/api-messaging';
import {
  AuthUser,
  COMMUNITY_ROUTING_KEYS,
  CommunityEvent,
  CommunityFilters, CommunityMember,
  CommunityMemberFilters,
  CommunityPricingType,
  CommunitySettings,
  CommunityType,
  CommunityVisibility,
  CreateCommunityRequest,
  MemberRole,
  MemberStatus,
  UpdateCommunityRequest,
  UserType
} from '@nlc-ai/api-types';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async createCommunity(createRequest: CreateCommunityRequest, creatorID: string, creatorType: UserType) {
    try {
      const existingCommunity = await this.prisma.community.findUnique({
        where: { slug: createRequest.slug },
      });

      if (existingCommunity) {
        throw new BadRequestException('A community with this URL slug already exists');
      }

      const defaultSettings: CommunitySettings = {
        allowMemberPosts: true,
        requireApproval: false,
        allowFileUploads: true,
        maxPostLength: 5000,
        allowPolls: true,
        allowEvents: false,
        moderationLevel: 'moderate',
      };

      const settings: CommunitySettings = {
        ...defaultSettings,
        ...createRequest.settings,
      };

      const isSystemCreated = createRequest.isSystemCreated === true && creatorType === UserType.admin;

      const pricingType = createRequest.pricing?.type || CommunityPricingType.FREE;
      const pricingAmount = createRequest.pricing?.amount || null;
      const pricingCurrency = createRequest.pricing?.currency || 'USD';

      const community = await this.prisma.community.create({
        data: {
          name: createRequest.name,
          description: createRequest.description,
          slug: createRequest.slug,
          type: createRequest.type,
          visibility: createRequest.visibility || CommunityVisibility.PRIVATE,
          ownerID: creatorID,
          ownerType: creatorType,
          coachID: createRequest.coachID,
          courseID: createRequest.courseID,
          avatarUrl: createRequest.avatarUrl,
          bannerUrl: createRequest.bannerUrl,

          pricingType: pricingType as any,
          pricingAmount,
          pricingCurrency,

          isSystemCreated,

          settings: settings as any,
          memberCount: (!isSystemCreated && creatorType === UserType.coach) ? 1 : 0,
        },
        include: {
          members: true,
        },
      });

      if (!isSystemCreated && creatorType !== UserType.admin) {
        await this.prisma.communityMember.create({
          data: {
            communityID: community.id,
            userID: creatorID,
            userType: creatorType,
            role: MemberRole.OWNER,
            status: MemberStatus.ACTIVE,
            permissions: ['all'],
            userName: await this.getUserName(creatorID, creatorType),
            userEmail: await this.getUserEmail(creatorID, creatorType),
            userAvatarUrl: await this.getUserAvatarUrl(creatorID, creatorType),
          },
        });
      }

      await this.outboxService.saveAndPublishEvent<CommunityEvent>({
        eventType: 'community.created',
        schemaVersion: 1,
        payload: {
          communityID: community.id,
          name: community.name,
          type: community.type as CommunityType,
          ownerID: creatorID,
          ownerType: creatorType,
          coachID: community.coachID,
          courseID: community.courseID,
          isSystemCreated,
          pricing: {
            type: pricingType,
            amount: pricingAmount,
            currency: pricingCurrency
          },
          createdAt: community.createdAt.toISOString(),
        },
      }, COMMUNITY_ROUTING_KEYS.CREATED);

      this.logger.log(
        `Community created: ${community.id} by ${creatorType} ${creatorID}${isSystemCreated ? ' (system)' : ''} - ${pricingType} pricing`
      );

      return community;
    } catch (error) {
      this.logger.error('Failed to create community', error);
      throw error;
    }
  }

  async createCoachCommunity(coachID: string) {
    const existingCommunity = await this.prisma.community.findFirst({
      where: {
        type: CommunityType.COACH_CLIENT,
        coachID: coachID,
      },
    });

    if (existingCommunity) {
      return existingCommunity;
    }

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { firstName: true, lastName: true, businessName: true },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    const communityName = coach.businessName || `${coach.firstName} ${coach.lastName}'s Community`;

    return this.createCommunity({
      name: communityName,
      description: `Welcome to ${communityName}! This is your space to connect with your coach and fellow community members.`,
      slug: communityName.toLowerCase() + '-' + 'community',
      type: CommunityType.COACH_CLIENT,
      visibility: CommunityVisibility.INVITE_ONLY,
      coachID: coachID,
      pricing: {
        type: CommunityPricingType.FREE,
        currency: 'USD'
      }
    }, coachID, UserType.coach);
  }

  async getCommunities(filters: CommunityFilters, userID: string, userType: UserType) {
    const where: any = {
      isActive: true,
    };

    if (filters.memberOf) {
      where.members = {
        some: {
          userID,
          userType,
          status: MemberStatus.ACTIVE,
        },
      };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.visibility) {
      where.visibility = filters.visibility;
    }

    if (filters.coachID) {
      where.coachID = filters.coachID;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.paginate(this.prisma.community, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      where,
      include: {
        members: {
          where: {userID, userType},
          select: {role: true, status: true, joinedAt: true},
        },
        _count: {
          select: {
            members: {
              where: {status: MemberStatus.ACTIVE},
            },
            posts: true,
          },
        },
      },
      orderBy: {createdAt: 'desc'},
    });
  }

  async getCommunity(id: string, userID: string, userType: UserType) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        members: {
          where: { status: MemberStatus.ACTIVE },
          orderBy: { joinedAt: 'asc' },
          take: 20,
        },
        _count: {
          select: {
            members: {
              where: { status: MemberStatus.ACTIVE },
            },
            posts: true,
          },
        },
      },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    let membership;

    if (userType !== UserType.admin) {
      membership = await this.prisma.communityMember.findUnique({
        where: {
          communityID_userID_userType: {
            communityID: id,
            userID,
            userType,
          },
        },
      });

      if (!membership && community.visibility !== CommunityVisibility.PUBLIC) {
        throw new ForbiddenException('Access denied to this community');
      }
    }

    return {
      ...community,
      userMembership: membership,
    };
  }

  async updateCommunity(id: string, updateRequest: UpdateCommunityRequest, userID: string, userType: UserType) {
    const community = await this.prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    await this.checkPermission(id, userID, userType, 'manage_community');

    const updateData: any = {
      ...updateRequest,
      updatedAt: new Date(),
    };

    if (updateRequest.pricing) {
      updateData.pricingType = updateRequest.pricing.type;
      updateData.pricingAmount = updateRequest.pricing.amount;
      updateData.pricingCurrency = updateRequest.pricing.currency || 'USD';
    }

    const updatedCommunity = await this.prisma.community.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Community ${id} updated by ${userType} ${userID}`);

    return updatedCommunity;
  }

  async getCommunityMembers(
    communityID: string,
    filters: CommunityMemberFilters,
    user: AuthUser
  ) {
    if (user.type !== UserType.admin) {
      await this.checkCommunityMembership(communityID, user.id, user.type);
    }

    const where: any = {
      communityID,
      status: MemberStatus.ACTIVE,
    };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userType) {
      where.userType = filters.userType;
    }

    if (filters.search) {
      where.OR = [
        { userName: { contains: filters.search, mode: 'insensitive' } },
        { userEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.joinedDateStart) {
      where.joinedAt = {
        ...where.joinedAt,
        gte: new Date(filters.joinedDateStart),
      };
    }

    if (filters.joinedDateEnd) {
      where.joinedAt = {
        ...where.joinedAt,
        lte: new Date(filters.joinedDateEnd),
      };
    }

    if (filters.lastActiveDateStart) {
      where.lastActiveAt = {
        ...where.lastActiveAt,
        gte: new Date(filters.lastActiveDateStart),
      };
    }

    if (filters.lastActiveDateEnd) {
      where.lastActiveAt = {
        ...where.lastActiveAt,
        lte: new Date(filters.lastActiveDateEnd),
      };
    }

    if (user.id) {
      where.NOT = {
        AND: [
          { userID: user.id },
          { userType: user.type }
        ]
      };
    }

    return this.prisma.paginate<CommunityMember>(this.prisma.communityMember, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      where,
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' }
      ],
    });
  }

  private async checkCommunityMembership(communityID: string, userID: string, userType: UserType) {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID,
          userType,
        },
      },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException('Access denied to this community');
    }

    return member;
  }

  private async updateMemberCount(communityID: string) {
    const count = await this.prisma.communityMember.count({
      where: {
        communityID,
        status: MemberStatus.ACTIVE,
      },
    });

    await this.prisma.community.update({
      where: { id: communityID },
      data: { memberCount: count },
    });
  }

  private async checkPermission(communityID: string, userID: string, userType: UserType, permission: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID,
          userType,
        },
      },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException('Access denied');
    }

    // Owners and admins have all permissions
    if (member.role === MemberRole.OWNER || member.role === MemberRole.ADMIN) {
      return true;
    }

    // Check specific permissions
    if (!member.permissions.includes(permission) && !member.permissions.includes('all')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private getDefaultPermissions(role: MemberRole): string[] {
    switch (role) {
      case MemberRole.OWNER:
        return ['all'];
      case MemberRole.ADMIN:
        return ['manage_community', 'manage_members', 'moderate_posts', 'create_posts', 'comment', 'react'];
      case MemberRole.MODERATOR:
        return ['moderate_posts', 'create_posts', 'comment', 'react'];
      case MemberRole.MEMBER:
        return ['create_posts', 'comment', 'react'];
      default:
        return ['comment', 'react'];
    }
  }

  async addMemberToCommunity(
    communityID: string,
    userID: string,
    userType: UserType,
    role: MemberRole = MemberRole.MEMBER,
    inviterID?: string
  ) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityID },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if already a member
    const existingMember = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID,
          userType,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === MemberStatus.ACTIVE) {
        return existingMember;
      }

      // Reactivate if suspended/inactive
      const updatedMember = await this.prisma.communityMember.update({
        where: { id: existingMember.id },
        data: {
          status: MemberStatus.ACTIVE,
          role,
          lastActiveAt: new Date(),
        },
      });

      await this.updateMemberCount(communityID);
      return updatedMember;
    }

    // Get user info for denormalized fields
    const userName = await this.getUserName(userID, userType);
    const userEmail = await this.getUserEmail(userID, userType);
    const userAvatarUrl = await this.getUserAvatarUrl(userID, userType);

    // Add new member
    const member = await this.prisma.communityMember.create({
      data: {
        communityID,
        userID,
        userType,
        role,
        status: MemberStatus.ACTIVE,
        invitedBy: inviterID,
        permissions: this.getDefaultPermissions(role),
        userName,
        userEmail,
        userAvatarUrl,
      },
    });

    await this.updateMemberCount(communityID);

    // Publish event
    await this.outboxService.saveAndPublishEvent<CommunityEvent>({
      eventType: 'community.member.joined',
      schemaVersion: 1,
      payload: {
        communityID,
        communityName: community.name,
        memberID: member.id,
        userID,
        userType,
        role,
        invitedBy: inviterID,
        joinedAt: member.joinedAt.toISOString(),
      },
    }, COMMUNITY_ROUTING_KEYS.MEMBER_JOINED);

    this.logger.log(`User ${userType} ${userID} joined community ${communityID}`);

    return member;
  }

  async addCoachToCoachCommunity(coachID: string) {
    const existingCommunity = await this.prisma.community.findFirst({
      where: {
        type: CommunityType.COACH_TO_COACH,
      },
    });

    if (existingCommunity) {
      return this.addMemberToCommunity(
        existingCommunity.id,
        coachID,
        UserType.coach,
        MemberRole.MEMBER
      );
    }

    return {};
  }

  async addClientToCoachCommunity(clientID: string, coachID: string) {
    // Find or create the coach's community
    let community = await this.prisma.community.findFirst({
      where: {
        type: CommunityType.COACH_CLIENT,
        coachID: coachID,
      },
    });

    if (!community) {
      community = await this.createCoachCommunity(coachID);
    }

    return this.addMemberToCommunity(
      community.id,
      clientID,
      UserType.client,
      MemberRole.MEMBER,
      coachID
    );
  }

  async removeMemberFromCommunity(communityID: string, targetUserID: string, targetUserType: UserType, actionByID: string, actionByType: UserType) {
    // Check permissions
    await this.checkPermission(communityID, actionByID, actionByType, 'remove_members');

    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID: targetUserID,
          userType: targetUserType,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in community');
    }

    // Cannot remove owner
    if (member.role === MemberRole.OWNER) {
      throw new ForbiddenException('Cannot remove community owner');
    }

    await this.prisma.communityMember.delete({
      where: { id: member.id },
    });

    await this.updateMemberCount(communityID);

    this.logger.log(`User ${targetUserType} ${targetUserID} removed from community ${communityID} by ${actionByType} ${actionByID}`);

    return { message: 'Member removed successfully' };
  }

  // Helper methods for getting user info
  private async getUserName(userID: string, userType: UserType): Promise<string> {
    try {
      switch (userType) {
        case UserType.coach:
          const coach = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, businessName: true },
          });
          return coach?.businessName || `${coach?.firstName} ${coach?.lastName}` || 'Unknown Coach';

        case UserType.client:
          const client = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true },
          });
          return `${client?.firstName} ${client?.lastName}` || 'Unknown Client';

        case UserType.admin:
          const admin = await this.prisma.admin.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true },
          });
          return `${admin?.firstName} ${admin?.lastName}` || 'Admin';

        default:
          return '';
      }
    } catch (error) {
      this.logger.warn(`Failed to get user email for ${userType} ${userID}`, error);
      return '';
    }
  }

  private async getUserEmail(userID: string, userType: UserType): Promise<string> {
    try {
      switch (userType) {
      case UserType.coach:
        const coach = await this.prisma.coach.findUnique({
          where: { id: userID },
          select: { email: true },
        });
        return coach?.email || '';

      case UserType.client:
        const client = await this.prisma.client.findUnique({
          where: { id: userID },
          select: { email: true },
        });
        return client?.email || '';

      case UserType.admin:
        const admin = await this.prisma.admin.findUnique({
          where: { id: userID },
          select: { email: true },
        });
        return admin?.email || '';

      default:
        return 'Unknown User';
      }
    } catch (error) {
      this.logger.warn(`Failed to get user name for ${userType} ${userID}`, error);
      return 'Unknown User';
    }
  }

  private async getUserAvatarUrl(userID: string, userType: UserType): Promise<string | null> {
    try {
      switch (userType) {
        case UserType.coach:
          const coach = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { avatarUrl: true },
          });
          return coach?.avatarUrl || null;

        case UserType.client:
          const client = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { avatarUrl: true },
          });
          return client?.avatarUrl || null;

        case UserType.admin:
          const admin = await this.prisma.admin.findUnique({
            where: { id: userID },
            select: { avatarUrl: true },
          });
          return admin?.avatarUrl || null;

        default:
          return null;
      }
    } catch (error) {
      this.logger.warn(`Failed to get user avatar for ${userType} ${userID}`, error);
      return null;
    }
  }
}
