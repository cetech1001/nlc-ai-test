import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {UserProfile, UserStats, UserType} from '@nlc-ai/types';
import { UpdateProfileDto } from './dto';

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async lookupProfile(userType: UserType, id: string) {
    let profile;

    switch (userType) {
      case UserType.COACH:
        profile = await this.prisma.coach.findUnique({
          where: { id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            avatarUrl: true,
            bio: true,
            websiteUrl: true,
          },
        });
        break;

      case UserType.CLIENT:
        profile = await this.prisma.client.findUnique({
          where: { id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        });
        break;

      case UserType.ADMIN:
        profile = await this.prisma.admin.findUnique({
          where: { id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        });
        break;

      default:
        throw new BadRequestException('Invalid user type');
    }

    if (!profile) {
      throw new NotFoundException(`${userType} profile not found`);
    }

    return profile;
  }

  async getProfile(userType: UserType, id: string) {
    let profile;

    switch (userType) {
      case UserType.COACH:
        profile = await this.prisma.coach.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            businessName: true,
            phone: true,
            avatarUrl: true,
            bio: true,
            websiteUrl: true,
            timezone: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        break;

      case UserType.CLIENT:
        profile = await this.prisma.client.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        break;

      case UserType.ADMIN:
        profile = await this.prisma.admin.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        break;

      default:
        throw new BadRequestException('Invalid user type');
    }

    if (!profile) {
      throw new NotFoundException(`${userType} profile not found`);
    }

    return profile;
  }

  async updateProfile(userType: UserType, id: string, updateProfileDto: UpdateProfileDto) {
    let updatedProfile;

    switch (userType) {
      case UserType.COACH:
        updatedProfile = await this.prisma.coach.update({
          where: { id },
          data: {
            ...updateProfileDto,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            businessName: true,
            phone: true,
            avatarUrl: true,
            bio: true,
            websiteUrl: true,
            timezone: true,
          },
        });
        break;

      case UserType.CLIENT:
        updatedProfile = await this.prisma.client.update({
          where: { id },
          data: {
            firstName: updateProfileDto.firstName,
            lastName: updateProfileDto.lastName,
            phone: updateProfileDto.phone,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        });
        break;

      case UserType.ADMIN:
        updatedProfile = await this.prisma.admin.update({
          where: { id },
          data: {
            firstName: updateProfileDto.firstName,
            lastName: updateProfileDto.lastName,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatarUrl: true,
          },
        });
        break;

      default:
        throw new BadRequestException('Invalid user type');
    }

    return {
      message: 'Profile updated successfully',
      profile: updatedProfile,
    };
  }

  // In users.service.ts
  async getUserProfile(userID: string, userType: UserType): Promise<UserProfile> {
    const baseSelect = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatarUrl: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      lastLoginAt: true,
    };

    if (userType === UserType.COACH) {
      const coach = await this.prisma.coach.findUnique({
        where: { id: userID },
        select: {
          ...baseSelect,
          businessName: true,
          bio: true,
          websiteUrl: true,
          phone: true,
          timezone: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
        },
      });

      if (!coach) throw new NotFoundException('Coach not found');
      return coach as UserProfile;
    } else if (userType === UserType.CLIENT) {
      const client = await this.prisma.client.findUnique({
        where: { id: userID },
        select: {
          ...baseSelect,
          source: true,
          tags: true,
          engagementScore: true,
          totalInteractions: true,
          lastInteractionAt: true,
        },
      });

      if (!client) throw new NotFoundException('Client not found');
      return client as unknown as UserProfile;
    } else {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userID },
        select: baseSelect,
      });

      if (!admin) throw new NotFoundException('Admin not found');
      return admin as UserProfile;
    }
  }

  async getUserStats(userID: string, userType: UserType): Promise<UserStats> {
    // Get community member for this user
    const member = await this.prisma.communityMember.findFirst({
      where: { userID, userType },
      select: { id: true, joinedAt: true }
    });

    if (!member) {
      return {
        totalPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        communitiesJoined: 0,
        joinedDate: new Date()
      };
    }

    const [postsCount, commentsCount, likesReceived, communitiesCount] = await Promise.all([
      this.prisma.post.count({
        where: { communityMemberID: member.id }
      }),
      this.prisma.postComment.count({
        where: { communityMemberID: member.id }
      }),
      this.prisma.postReaction.count({
        where: {
          OR: [
            { post: { communityMemberID: member.id } },
            { comment: { communityMemberID: member.id } }
          ]
        }
      }),
      this.prisma.communityMember.count({
        where: { userID, userType }
      })
    ]);

    return {
      totalPosts: postsCount,
      totalComments: commentsCount,
      totalLikes: likesReceived,
      communitiesJoined: communitiesCount,
      joinedDate: member.joinedAt
    };
  }
}
