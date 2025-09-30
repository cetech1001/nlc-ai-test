import {BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {OutboxService} from '@nlc-ai/api-messaging';
import {
  AuthUser,
  COMMUNITY_ROUTING_KEYS,
  CommunityActivity,
  CommunityEvent,
  CommunityFilters,
  CommunityMember,
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
} from '@nlc-ai/types';
import {Community} from "@prisma/client";


@Injectable()
export class CommunitiesService {
  private readonly logger = new Logger(CommunitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async createCommunity(createRequest: CreateCommunityRequest, userID: string, userType: UserType) {
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

      const isSystemCreated = createRequest.isSystemCreated === true && userType === UserType.ADMIN;

      const pricingType = createRequest.pricing?.type || CommunityPricingType.FREE;

      let oneTimePrice = null;
      let monthlyPrice = null;
      let annualPrice = null;

      if (createRequest.pricing) {
        switch (createRequest.pricing.type) {
          case CommunityPricingType.ONE_TIME:
            oneTimePrice = createRequest.pricing.amount;
            break;
          case CommunityPricingType.MONTHLY:
            monthlyPrice = createRequest.pricing.amount;
            break;
          case CommunityPricingType.ANNUAL:
            annualPrice = createRequest.pricing.amount;
            break;
        }
      }

      const currency = createRequest.pricing?.currency || 'USD';

      const community = await this.prisma.community.create({
        data: {
          name: createRequest.name,
          description: createRequest.description,
          slug: createRequest.slug,
          type: createRequest.type,
          visibility: createRequest.visibility || CommunityVisibility.PRIVATE,
          ownerID: userID,
          ownerType: userType,
          coachID: createRequest.coachID,
          courseID: createRequest.courseID,
          avatarUrl: createRequest.avatarUrl,
          bannerUrl: createRequest.bannerUrl,

          pricingType: pricingType as any,
          oneTimePrice,
          monthlyPrice,
          annualPrice,
          currency,

          isSystemCreated,

          settings: settings as any,
          memberCount: (!isSystemCreated && userType === UserType.COACH) ? 1 : 0,
        },
        include: {
          members: true,
        },
      });

      if (!isSystemCreated && userType !== UserType.ADMIN) {
        const { name, email, avatarUrl } = await this.getUserInfo(userID, userType);
        await this.prisma.communityMember.create({
          data: {
            communityID: community.id,
            userID: userID,
            userType: userType,
            role: MemberRole.OWNER,
            status: MemberStatus.ACTIVE,
            permissions: ['all'],
            userName: name,
            userEmail: email,
            userAvatarUrl: avatarUrl,
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
          ownerID: userID,
          ownerType: userType,
          coachID: community.coachID,
          courseID: community.courseID,
          isSystemCreated,
          pricing: {
            type: pricingType,
            amount: oneTimePrice || monthlyPrice || annualPrice,
            currency: currency
          },
          createdAt: community.createdAt.toISOString(),
        },
      }, COMMUNITY_ROUTING_KEYS.CREATED);

      this.logger.log(
        `Community created: ${community.id} by ${userType} ${userID}${isSystemCreated ? ' (system)' : ''} - ${pricingType} pricing`
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
      slug: communityName.toLowerCase().replace(' ', '-'),
      type: CommunityType.COACH_CLIENT,
      visibility: CommunityVisibility.INVITE_ONLY,
      coachID: coachID,
      pricing: {
        type: CommunityPricingType.FREE,
        currency: 'USD'
      }
    }, coachID, UserType.COACH);
  }

  async getCommunities(filters: CommunityFilters, user: AuthUser) {
    const where: any = {
      isActive: true,
    };

    if (filters.memberOf) {
      where.members = {
        some: {
          userID: user.id,
          userType: user.type,
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
          where: {userID: user.id, userType: user.type},
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

  async getCommunityByID(id: string, user: AuthUser) {
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

    return this.getCommunity(community, user);
  }

  async getCommunityBySlug(slug: string, user: AuthUser) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
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

    return this.getCommunity(community, user);
  }

  private async getCommunity(community: Community | null, user: AuthUser) {
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    let membership;

    if (user.type !== UserType.ADMIN) {
      membership = await this.prisma.communityMember.findUnique({
        where: {
          communityID_userID_userType: {
            communityID: community.id,
            userID: user.id,
            userType: user.type,
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

  async getCoachCommunity(coachID: string, user: AuthUser) {
    const community = await this.prisma.community.findFirst({
      where: {
        ownerID: coachID,
      },
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

    return this.getCommunity(community, user);
  }

  async updateCommunity(id: string, updateRequest: UpdateCommunityRequest, user: AuthUser) {
    const community = await this.prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    await this.checkPermission(id, user, 'manage_community');

    const updateData: any = {
      ...updateRequest,
      updatedAt: new Date(),
    };

    if (updateRequest.pricing) {
      updateData.pricingType = updateRequest.pricing.type;

      // Reset all pricing fields
      updateData.oneTimePrice = null;
      updateData.monthlyPrice = null;
      updateData.annualPrice = null;

      // Set the appropriate pricing field based on type
      switch (updateRequest.pricing.type) {
        case CommunityPricingType.ONE_TIME:
          updateData.oneTimePrice = updateRequest.pricing.amount;
          break;
        case CommunityPricingType.MONTHLY:
          updateData.monthlyPrice = updateRequest.pricing.amount;
          break;
        case CommunityPricingType.ANNUAL:
          updateData.annualPrice = updateRequest.pricing.amount;
          break;
      }

      updateData.currency = updateRequest.pricing.currency || 'USD';
    }

    const updatedCommunity = await this.prisma.community.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Community ${id} updated by ${user.type} ${user.id}`);

    return updatedCommunity;
  }

  async getCommunityMembers(
    communityID: string,
    filters: CommunityMemberFilters,
    user: AuthUser
  ) {
    if (user.type !== UserType.ADMIN) {
      await this.checkCommunityMembership(communityID, user);
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

  async getCommunityActivity(communityID: string, limit: number, user: AuthUser) {
    if (user.type !== UserType.ADMIN) {
      await this.checkCommunityMembership(communityID, user);
    }

    const recentPosts = await this.prisma.post.findMany({
      where: { communityID, isDeleted: false },
      include: {
        communityMember: {
          select: {
            id: true,
            userName: true,
            userAvatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit * 0.4),
    });

    const recentMembers = await this.prisma.communityMember.findMany({
      where: { communityID, status: MemberStatus.ACTIVE },
      orderBy: { joinedAt: 'desc' },
      take: Math.floor(limit * 0.3),
    });

    const recentComments = await this.prisma.postComment.findMany({
      where: {
        post: { communityID },
      },
      include: {
        communityMember: {
          select: {
            id: true,
            userName: true,
            userAvatarUrl: true,
          },
        },
        post: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit * 0.3),
    });

    const activities: Array<CommunityActivity> = [];

    recentPosts.forEach(post => {
      activities.push({
        id: `post-${post.id}`,
        type: 'post_created',
        userID: post.communityMemberID,
        userName: post.communityMember?.userName,
        userAvatarUrl: post.communityMember?.userAvatarUrl,
        description: `created a new post`,
        createdAt: post.createdAt,
        metadata: {
          postID: post.id,
        },
      });
    });

    recentMembers.forEach(member => {
      activities.push({
        id: `member-${member.id}`,
        type: 'member_joined',
        userID: member.userID,
        userName: member.userName,
        userAvatarUrl: member.userAvatarUrl,
        description: `joined the community`,
        createdAt: member.joinedAt,
        metadata: {
          memberRole: member.role,
        },
      });
    });

    recentComments.forEach(comment => {
      activities.push({
        id: `comment-${comment.id}`,
        type: 'comment_added',
        userID: comment.communityMemberID,
        userName: comment.communityMember?.userName,
        userAvatarUrl: comment.communityMember?.userAvatarUrl,
        description: `commented on a post`,
        createdAt: comment.createdAt,
        metadata: {
          postID: comment.postID,
        },
      });
    });

    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getCommunityAnalytics(communityID: string, period: '7d' | '30d' | '90d', user: AuthUser) {
    if (user.type !== UserType.ADMIN) {
      await this.checkPermission(communityID, user, 'view_analytics');
    }

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const newMembers = await this.prisma.communityMember.count({
      where: {
        communityID,
        status: MemberStatus.ACTIVE,
        joinedAt: { gte: startDate },
      },
    });

    const totalPosts = await this.prisma.post.count({
      where: { communityID, isDeleted: false },
    });

    const newPosts = await this.prisma.post.count({
      where: {
        communityID,
        isDeleted: false,
        createdAt: { gte: startDate },
      },
    });

    const totalComments = await this.prisma.postComment.count({
      where: {
        post: { communityID },
      },
    });

    const newComments = await this.prisma.postComment.count({
      where: {
        post: { communityID },
        createdAt: { gte: startDate },
      },
    });

    const activeMembers = await this.prisma.communityMember.count({
      where: {
        communityID,
        status: MemberStatus.ACTIVE,
        OR: [
          {
            posts: {
              some: {
                createdAt: { gte: startDate },
                isDeleted: false,
              },
            },
          },
          {
            comments: {
              some: {
                createdAt: { gte: startDate },
              },
            },
          },
        ],
      },
    });

    // Calculate growth percentages
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    const previousMembers = await this.prisma.communityMember.count({
      where: {
        communityID,
        status: MemberStatus.ACTIVE,
        joinedAt: { gte: previousPeriodStart, lt: startDate },
      },
    });

    const previousPosts = await this.prisma.post.count({
      where: {
        communityID,
        isDeleted: false,
        createdAt: { gte: previousPeriodStart, lt: startDate },
      },
    });

    const memberGrowth = previousMembers === 0 ? 100 : ((newMembers - previousMembers) / previousMembers) * 100;
    const postGrowth = previousPosts === 0 ? 100 : ((newPosts - previousPosts) / previousPosts) * 100;

    const engagementRate = newPosts === 0 ? 0 : newComments / newPosts;

    return {
      memberGrowth: Math.round(memberGrowth * 100) / 100,
      postGrowth: Math.round(postGrowth * 100) / 100,
      engagementRate: Math.round(engagementRate * 100) / 100,
      activeMembers,
      totalPosts,
      totalComments,
      averagePostsPerDay: Math.round((newPosts / days) * 100) / 100,
    };
  }

  private async checkCommunityMembership(communityID: string, user: AuthUser) {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID: user.id,
          userType: user.type,
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

  private async checkPermission(communityID: string, user: AuthUser, permission: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID: user.id,
          userType: user.type,
        },
      },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException('Access denied');
    }

    if (member.role === MemberRole.OWNER || member.role === MemberRole.ADMIN) {
      return true;
    }

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

    const { name, email, avatarUrl } = await this.getUserInfo(userID, userType);

    const member = await this.prisma.communityMember.create({
      data: {
        communityID,
        userID,
        userType,
        role,
        status: MemberStatus.ACTIVE,
        invitedBy: inviterID,
        permissions: this.getDefaultPermissions(role),
        userName: name,
        userEmail: email,
        userAvatarUrl: avatarUrl,
      },
    });

    await this.updateMemberCount(communityID);

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
        UserType.COACH,
        MemberRole.MEMBER
      );
    }

    return {};
  }

  async addClientToCoachCommunity(clientID: string, coachID: string) {
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
      UserType.CLIENT,
      MemberRole.MEMBER,
      coachID
    );
  }

  async removeMemberFromCommunity(communityID: string, targetUserID: string, targetUserType: UserType, user: AuthUser) {
    await this.checkPermission(communityID, user, 'remove_members');

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

    this.logger.log(`User ${targetUserType} ${targetUserID} removed from community ${communityID} by ${user.type} ${user.id}`);

    return { message: 'Member removed successfully' };
  }

  private async getUserInfo(userID: string, userType: UserType): Promise<{
    name: string;
    email: string;
    avatarUrl: string;
  }> {
    try {
      switch (userType) {
        case UserType.COACH:
          const coach = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, email: true, avatarUrl: true, businessName: true },
          });
          return {
            name: coach?.businessName || `${coach?.firstName} ${coach?.lastName}` || 'Unknown Coach',
            email: coach?.email || '',
            avatarUrl: coach?.avatarUrl || '',
          };

        case UserType.CLIENT:
          const client = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, email: true, avatarUrl: true },
          });
          return {
            name: `${client?.firstName} ${client?.lastName}` || 'Unknown Client',
            email: client?.email || '',
            avatarUrl: client?.avatarUrl || '',
          };

        case UserType.ADMIN:
          const admin = await this.prisma.admin.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, email: true, avatarUrl: true },
          });
          return {
            name: `${admin?.firstName} ${admin?.lastName}` || 'Admin',
            email: admin?.email || '',
            avatarUrl: admin?.avatarUrl || '',
          };

        default:
          return {
            name: '',
            email: '',
            avatarUrl: '',
          };
      }
    } catch (error) {
      this.logger.warn(`Failed to get user info for ${userType} ${userID}`, error);
      return {
        name: '',
        email: '',
        avatarUrl: '',
      };
    }
  }

  // Add these methods to CommunitiesService class

  async getCommunityStats() {
    const totalCommunities = await this.prisma.community.count({
      where: { isDeleted: false },
    });

    const activeCommunities = await this.prisma.community.count({
      where: {
        isDeleted: false,
        isActive: true,
      },
    });

    const coachToCommunities = await this.prisma.community.count({
      where: {
        isDeleted: false,
        type: CommunityType.COACH_TO_COACH,
      },
    });

    const coachClientCommunities = await this.prisma.community.count({
      where: {
        isDeleted: false,
        type: CommunityType.COACH_CLIENT,
      },
    });

    const totalMembers = await this.prisma.communityMember.count({
      where: {
        status: MemberStatus.ACTIVE,
      },
    });

    const totalPosts = await this.prisma.post.count({
      where: {
        isDeleted: false,
      },
    });

    const avgMembersPerCommunity = totalCommunities > 0
      ? Math.round((totalMembers / totalCommunities) * 10) / 10
      : 0;

    const avgPostsPerCommunity = totalCommunities > 0
      ? Math.round((totalPosts / totalCommunities) * 10) / 10
      : 0;

    return {
      total: totalCommunities,
      active: activeCommunities,
      coachToCommunities,
      coachClientCommunities,
      totalMembers,
      totalPosts,
      avgMembersPerCommunity,
      avgPostsPerCommunity,
    };
  }

  async getCommunityMemberStats(communityID: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    owners: number;
    admins: number;
    moderators: number;
    regularMembers: number;
    suspendedMembers: number;
    pendingMembers: number;
  }> {
    const community = await this.prisma.community.findUnique({
      where: { id: communityID },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const [
      totalMembers,
      activeMembers,
      owners,
      admins,
      moderators,
      regularMembers,
      suspendedMembers,
      pendingMembers,
    ] = await Promise.all([
      this.prisma.communityMember.count({
        where: { communityID },
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          status: MemberStatus.ACTIVE,
        },
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          role: MemberRole.OWNER,
          status: MemberStatus.ACTIVE,
        },
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          role: MemberRole.ADMIN,
          status: MemberStatus.ACTIVE,
        },
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          role: MemberRole.MODERATOR,
          status: MemberStatus.ACTIVE,
        },
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACTIVE,
        },
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          status: MemberStatus.SUSPENDED,
        },
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          status: MemberStatus.PENDING,
        },
      }),
    ]);

    return {
      totalMembers,
      activeMembers,
      owners,
      admins,
      moderators,
      regularMembers,
      suspendedMembers,
      pendingMembers,
    };
  }

  async inviteMemberToCommunity(
    communityID: string,
    inviteeID: string,
    inviteeType: UserType,
    inviterID: string,
    inviterType: UserType,
    message?: string
  ): Promise<any> {
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
          userID: inviteeID,
          userType: inviteeType,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this community');
    }

    const existingInvite = await this.prisma.communityInvite.findFirst({
      where: {
        communityID,
        inviteeID,
        inviteeType: inviteeType as string,
        status: 'pending',
        expiresAt: { gte: new Date() },
      },
    });

    if (existingInvite) {
      throw new BadRequestException('An active invitation already exists for this user');
    }

    const token = `${communityID}-${inviteeID}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.communityInvite.create({
      data: {
        communityID,
        inviterID,
        inviterType: inviterType as string,
        inviteeID,
        inviteeType: inviteeType as string,
        message,
        token,
        expiresAt,
      },
    });

    const inviter = await this.getUserInfo(inviterID, inviterType);
    const invitee = await this.getUserInfo(inviteeID, inviteeType);

    await this.outboxService.saveAndPublishEvent<CommunityEvent>({
      eventType: 'community.member.invited',
      schemaVersion: 1,
      payload: {
        communityID,
        communityName: community.name,
        inviteID: invite.id,
        inviterID,
        inviterType,
        inviterName: inviter.name,
        inviteeID,
        inviteeType,
        inviteeName: invitee.name,
        token: invite.token,
        invitedAt: new Date().toISOString(),
        expiresAt: invite.expiresAt.toISOString(),
      },
    }, COMMUNITY_ROUTING_KEYS.MEMBER_INVITED);

    this.logger.log(
      `Invitation sent: ${inviterType} ${inviterID} invited ${inviteeType} ${inviteeID} to community ${communityID}`
    );

    return {
      ...invite,
      inviteUrl: `${process.env.WEB_URL}/communities/join/${invite.token}`,
    };
  }
}
