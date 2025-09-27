import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {AuthEvent, UpdatePasswordRequest, UpdateProfileRequest, UserProfile, UserStats, UserType} from '@nlc-ai/types';
import { UpdateProfileDto } from './dto';
import * as bcrypt from "bcryptjs";

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

  async uploadAvatar(userID: string, userType: UserType, avatarUrl: string) {
    try {
      if (userType === UserType.COACH) {
        await this.coachAuthService.uploadAvatar(userID, avatarUrl);
      } else if (userType === UserType.ADMIN) {
        await this.adminAuthService.uploadAvatar(userID, avatarUrl);
      } else if (userType === UserType.CLIENT) {
        await this.clientAuthService.uploadAvatar(userID, avatarUrl);
      }

      // Emit avatar updated event
      await this.outbox.saveAndPublishEvent<AuthEvent>(
        {
          eventType: 'auth.avatar.updated',
          schemaVersion: 1,
          payload: {
            userID,
            userType,
            avatarUrl,
          },
        },
        'auth.avatar.updated'
      );

      return {
        message: 'Avatar uploaded successfully',
        avatarUrl,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  // async updateProfile(userID: string, userType: UserType, updateProfileDto: UpdateProfileRequest) {
  //   let result;
  //
  //   // Delegate to specific service
  //   if (userType === UserType.COACH) {
  //     result = await this.coachAuthService.updateProfile(userID, updateProfileDto);
  //   } else if (userType === UserType.ADMIN) {
  //     result = await this.adminAuthService.updateProfile(userID, updateProfileDto);
  //   } else if (userType === UserType.CLIENT) {
  //     result = await this.clientAuthService.updateProfile(userID, updateProfileDto);
  //   } else {
  //     throw new BadRequestException('Invalid user type');
  //   }
  //
  //   // Emit profile updated event
  //   await this.outbox.saveAndPublishEvent<AuthEvent>(
  //     {
  //       eventType: userType === UserType.COACH ? 'auth.coach.profile.updated' :
  //         userType === UserType.ADMIN ? 'auth.admin.profile.updated' :
  //           'auth.client.profile.updated',
  //       schemaVersion: 1,
  //       payload: {
  //         userID,
  //         email: result.user.email,
  //         firstName: result.user.firstName,
  //         lastName: result.user.lastName,
  //         ...(userType === UserType.ADMIN && { role: (result.user as Admin).role }),
  //       },
  //     },
  //     `auth.${userType}.profile.updated`
  //   );
  //
  //   return result;
  // }

  async updatePassword(userID: string, userType: UserType, updatePasswordDto: UpdatePasswordRequest) {
    let result;

    const passwordHash = await bcrypt.hash(updatePasswordDto.newPassword, 12);

    // Delegate to specific service
    if (userType === UserType.COACH) {
      result = await this.coachAuthService.updatePassword(passwordHash, userID);
    } else if (userType === UserType.ADMIN) {
      result = await this.adminAuthService.updatePassword(passwordHash, userID);
    } else if (userType === UserType.CLIENT) {
      result = await this.clientAuthService.updatePassword(passwordHash, userID);
    } else {
      throw new BadRequestException('Invalid user type');
    }

    // Emit password updated event (without sensitive data)
    await this.outbox.saveAndPublishEvent<AuthEvent>(
      {
        eventType: 'auth.password.updated',
        schemaVersion: 1,
        payload: {
          userID,
          userType,
          updatedAt: new Date().toISOString(),
        },
      },
      'auth.password.updated'
    );

    return result;
  }
}
