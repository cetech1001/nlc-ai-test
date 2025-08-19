import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { UserType } from '@nlc-ai/api-types';
import {
  CommunityType,
  CommunityVisibility,
  MemberRole,
  MemberStatus,
  CommunityEvent,
  COMMUNITY_ROUTING_KEYS
} from '@nlc-ai/api-types';
import { CreateCommunityDto, UpdateCommunityDto, CommunityFiltersDto } from './dto';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async createCommunity(createDto: CreateCommunityDto, creatorID: string, creatorType: UserType) {
    try {
      const community = await this.prisma.community.create({
        data: {
          name: createDto.name,
          description: createDto.description,
          type: createDto.type,
          visibility: createDto.visibility || CommunityVisibility.PRIVATE,
          ownerID: creatorID,
          ownerType: creatorType,
          coachID: createDto.coachID,
          courseID: createDto.courseID,
          avatarUrl: createDto.avatarUrl,
          bannerUrl: createDto.bannerUrl,
          settings: createDto.settings || {},
          memberCount: 1, // Creator is automatically a member
        },
        include: {
          members: true,
        },
      });

      // Add creator as owner
      await this.prisma.communityMember.create({
        data: {
          communityID: community.id,
          userID: creatorID,
          userType: creatorType,
          role: MemberRole.OWNER,
          status: MemberStatus.ACTIVE,
          permissions: ['all'],
        },
      });

      // Publish event
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
          createdAt: community.createdAt.toISOString(),
        },
      }, COMMUNITY_ROUTING_KEYS.CREATED);

      this.logger.log(`Community created: ${community.id} by ${creatorType} ${creatorID}`);

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

    // Get coach details for community name
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
      type: CommunityType.COACH_CLIENT,
      visibility: CommunityVisibility.INVITE_ONLY,
      coachID: coachID,
    }, coachID, UserType.coach);
  }

  async createCoachToCoachCommunity() {
    const existingCommunity = await this.prisma.community.findFirst({
      where: {
        type: CommunityType.COACH_TO_COACH,
      },
    });

    if (existingCommunity) {
      return existingCommunity;
    }

    // Create the global coach-to-coach community
    return this.createCommunity({
      name: 'Coach Network',
      description: 'Connect, collaborate, and grow with fellow coaches in the Next Level Coach community.',
      type: CommunityType.COACH_TO_COACH,
      visibility: CommunityVisibility.PRIVATE,
    }, 'system', UserType.admin);
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
      },
    });

    await this.updateMemberCount(communityID);

    // Get user name for event
    // const userName = await this.getUserName(userID, userType);

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
    // Ensure the coach-to-coach community exists
    const community = await this.createCoachToCoachCommunity();

    return this.addMemberToCommunity(
      community.id,
      coachID,
      UserType.coach,
      MemberRole.MEMBER
    );
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

  async getCommunities(filters: CommunityFiltersDto, userID: string, userType: UserType) {
    const where: any = {
      isActive: true,
    };

    // Filter by user's memberships
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

    const [communities, total] = await Promise.all([
      this.prisma.community.findMany({
        where,
        include: {
          members: {
            where: { userID, userType },
            select: { role: true, status: true, joinedAt: true },
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
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
      }),
      this.prisma.community.count({ where }),
    ]);

    return {
      communities,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
  }

  async getCommunity(id: string, userID: string, userType: UserType) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        members: {
          where: { status: MemberStatus.ACTIVE },
          orderBy: { joinedAt: 'asc' },
          take: 20, // Limit for performance
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

    // Check if user has access
    const membership = await this.prisma.communityMember.findUnique({
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

    return {
      ...community,
      userMembership: membership,
    };
  }

  async updateCommunity(id: string, updateDto: UpdateCommunityDto, userID: string, userType: UserType) {
    const community = await this.prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check permissions
    await this.checkPermission(id, userID, userType, 'manage_community');

    const updatedCommunity = await this.prisma.community.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Community ${id} updated by ${userType} ${userID}`);

    return updatedCommunity;
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

  /*private async getUserName(userID: string, userType: UserType): Promise<string> {
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
          return 'Unknown User';
      }
    } catch (error) {
      this.logger.warn(`Failed to get user name for ${userType} ${userID}`, error);
      return 'Unknown User';
    }
  }*/
}
