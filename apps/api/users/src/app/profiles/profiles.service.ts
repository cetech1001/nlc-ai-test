import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UserProfile, UserStats, UserType } from '@nlc-ai/types';
import { UpdateProfileDto, UpdatePasswordDto } from './dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async lookupProfile(userType: UserType, id: string): Promise<UserProfile> {
    let profile;

    switch (userType) {
      case UserType.COACH:
        profile = await this.prisma.coach.findUnique({
          where: { id, isDeleted: false },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            avatarUrl: true,
            bio: true,
            websiteUrl: true,
            isVerified: true,
            location: true,
            isActive: true,
            email: true,
            createdAt: true,
          },
        });
        break;

      case UserType.CLIENT:
        profile = await this.prisma.client.findUnique({
          where: { id, isDeleted: false },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            isVerified: true,
            location: true,
            isActive: true,
            email: true,
            createdAt: true,
          },
        });
        break;

      case UserType.ADMIN:
        profile = await this.prisma.admin.findUnique({
          where: { id, isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            isActive: true,
            email: true,
            createdAt: true,
          },
        });
        break;

      default:
        throw new BadRequestException('Invalid user type');
    }

    if (!profile) {
      throw new NotFoundException(`${userType} profile not found`);
    }

    return {
      ...profile,
      type: userType,
    };
  }

  async getProfile(userType: UserType, id: string): Promise<UserProfile> {
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
            subscriptionStatus: true,
            subscriptionPlan: true,
            isActive: true,
            isVerified: true,
            location: true,
            createdAt: true,
            lastLoginAt: true,
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
            source: true,
            tags: true,
            engagementScore: true,
            totalInteractions: true,
            lastInteractionAt: true,
            isActive: true,
            isVerified: true,
            location: true,
            createdAt: true,
            lastLoginAt: true,
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
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
          },
        });
        break;

      default:
        throw new BadRequestException('Invalid user type');
    }

    if (!profile) {
      throw new NotFoundException(`${userType} profile not found`);
    }

    const score = (profile as any).engagementScore;

    return {
      ...profile,
      engagementScore: score ? Number(score) : undefined,
      type: userType,
    };
  }

  async updateProfile(userType: UserType, id: string, updateProfileDto: UpdateProfileDto): Promise<{
    message: string;
    profile: UserProfile;
  }> {
    if (updateProfileDto.email) {
      await this.checkEmailConflict(userType, id, updateProfileDto.email);
    }

    let updatedProfile;
    const updateData = {
      ...updateProfileDto,
      updatedAt: new Date(),
    };

    switch (userType) {
      case UserType.COACH:
        updatedProfile = await this.prisma.coach.update({
          where: { id },
          data: updateData,
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
            updatedAt: true,
            isActive: true,
            createdAt: true,
            isVerified: true,
            location: true,
          },
        });
        break;

      case UserType.CLIENT:
        const clientUpdateData = {
          firstName: updateProfileDto.firstName,
          lastName: updateProfileDto.lastName,
          email: updateProfileDto.email,
          phone: updateProfileDto.phone,
          updatedAt: new Date(),
        };

        updatedProfile = await this.prisma.client.update({
          where: { id },
          data: clientUpdateData,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            updatedAt: true,
            isActive: true,
            createdAt: true,
            isVerified: true,
            location: true,
          },
        });
        break;

      case UserType.ADMIN:
        const adminUpdateData = {
          firstName: updateProfileDto.firstName,
          lastName: updateProfileDto.lastName,
          email: updateProfileDto.email,
          updatedAt: new Date(),
        };

        updatedProfile = await this.prisma.admin.update({
          where: { id },
          data: adminUpdateData,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatarUrl: true,
            updatedAt: true,
            isActive: true,
            createdAt: true,
          },
        });
        break;

      default:
        throw new BadRequestException('Invalid user type');
    }

    return {
      message: 'Profile updated successfully',
      profile: {
        ...updatedProfile,
        type: userType,
      },
    };
  }

  async updatePassword(userID: string, userType: UserType, updatePasswordDto: UpdatePasswordDto) {
    const { confirmPassword, newPassword } = updatePasswordDto;

    let user;
    switch (userType) {
      case UserType.COACH:
        user = await this.prisma.coach.findUnique({
          where: { id: userID },
          select: { id: true },
        });
        break;
      case UserType.CLIENT:
        user = await this.prisma.client.findUnique({
          where: { id: userID },
          select: { id: true },
        });
        break;
      case UserType.ADMIN:
        user = await this.prisma.admin.findUnique({
          where: { id: userID },
          select: { id: true },
        });
        break;
      default:
        throw new BadRequestException('Invalid user type');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    const updateData = {
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    };

    switch (userType) {
      case UserType.COACH:
        await this.prisma.coach.update({
          where: { id: userID },
          data: updateData,
        });
        break;
      case UserType.CLIENT:
        await this.prisma.client.update({
          where: { id: userID },
          data: updateData,
        });
        break;
      case UserType.ADMIN:
        await this.prisma.admin.update({
          where: { id: userID },
          data: updateData,
        });
        break;
    }

    return {
      message: 'Password updated successfully',
    };
  }

  async uploadAvatar(userID: string, userType: UserType, avatarUrl: string) {
    if (!avatarUrl) {
      throw new BadRequestException('Avatar URL is required');
    }

    const updateData = {
      avatarUrl,
      updatedAt: new Date(),
    };

    let updatedUser;
    switch (userType) {
      case UserType.COACH:
        updatedUser = await this.prisma.coach.update({
          where: { id: userID },
          data: updateData,
          select: { avatarUrl: true },
        });
        break;
      case UserType.CLIENT:
        updatedUser = await this.prisma.client.update({
          where: { id: userID },
          data: updateData,
          select: { avatarUrl: true },
        });
        break;
      case UserType.ADMIN:
        updatedUser = await this.prisma.admin.update({
          where: { id: userID },
          data: updateData,
          select: { avatarUrl: true },
        });
        break;
      default:
        throw new BadRequestException('Invalid user type');
    }

    await this.prisma.communityMember.updateMany({
      where: {
        userID,
      },
      data: {
        userAvatarUrl: avatarUrl,
      }
    });

    return {
      message: 'Avatar uploaded successfully',
      avatarUrl: updatedUser.avatarUrl,
    };
  }

  async getUserStats(userID: string, userType: UserType): Promise<UserStats> {
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

  private async checkEmailConflict(userType: UserType, userID: string, email: string) {
    const [coachExists, clientExists, adminExists] = await Promise.all([
      this.prisma.coach.findFirst({
        where: {
          email,
          id: { not: userType === UserType.COACH ? userID : undefined },
          isDeleted: false
        }
      }),
      this.prisma.client.findFirst({
        where: {
          email,
          id: { not: userType === UserType.CLIENT ? userID : undefined },
          isDeleted: false
        }
      }),
      this.prisma.admin.findFirst({
        where: {
          email,
          id: { not: userType === UserType.ADMIN ? userID : undefined },
          isActive: true
        }
      }),
    ]);

    if (coachExists || clientExists || adminExists) {
      throw new ConflictException('Email already exists');
    }
  }

  // Add these methods to apps/api/users/src/app/profiles/profiles.service.ts

  async followCoach(followerID: string, followerType: UserType, coachID: string) {
    // Check if coach exists and is active
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID, isDeleted: false, isActive: true },
      select: { id: true }
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    // Prevent self-following
    if (followerType === UserType.COACH && followerID === coachID) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await this.prisma.coachFollow.findUnique({
      where: {
        coachID_followerID_followerType: {
          coachID,
          followerID,
          followerType,
        }
      }
    });

    if (existingFollow) {
      throw new ConflictException('Already following this coach');
    }

    // Create follow relationship
    await this.prisma.coachFollow.create({
      data: {
        coachID,
        followerID,
        followerType,
      }
    });

    return {
      message: 'Successfully followed coach',
      isFollowing: true
    };
  }

  async unfollowCoach(followerID: string, followerType: UserType, coachID: string) {
    const follow = await this.prisma.coachFollow.findUnique({
      where: {
        coachID_followerID_followerType: {
          coachID,
          followerID,
          followerType,
        }
      }
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.prisma.coachFollow.delete({
      where: {
        id: follow.id
      }
    });

    return {
      message: 'Successfully unfollowed coach',
      isFollowing: false
    };
  }

  async checkFollowStatus(followerID: string, followerType: UserType, coachID: string): Promise<boolean> {
    const follow = await this.prisma.coachFollow.findUnique({
      where: {
        coachID_followerID_followerType: {
          coachID,
          followerID,
          followerType,
        }
      }
    });

    return !!follow;
  }

  async getFollowCounts(coachID: string): Promise<{ followersCount: number; followingCount: number }> {
    const [followersCount, followingCount] = await Promise.all([
      // Count followers of this coach
      this.prisma.coachFollow.count({
        where: { coachID }
      }),
      // Count coaches this user follows (only if they're a coach)
      this.prisma.coachFollow.count({
        where: {
          followerID: coachID,
          followerType: UserType.COACH
        }
      })
    ]);

    return {
      followersCount,
      followingCount
    };
  }
}
