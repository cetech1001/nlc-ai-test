import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {
  AuthUser,
  COMMUNITY_ROUTING_KEYS,
  CommunityEvent,
  CommunityMember,
  CommunityMemberFilters,
  MemberRole,
  MemberStatus,
  UserType
} from '@nlc-ai/types';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

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

  async getUserMembership(communityID: string, user: AuthUser) {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID: user.id,
          userType: user.type,
        },
      },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          }
        }
      }
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this community');
    }

    return member;
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

    await this.outbox.saveAndPublishEvent<CommunityEvent>({
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

  async removeMemberFromCommunity(
    communityID: string,
    targetUserID: string,
    targetUserType: UserType,
    user: AuthUser
  ) {
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

    await this.outbox.saveAndPublishEvent<CommunityEvent>({
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
}
