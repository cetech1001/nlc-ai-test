import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UserType } from '@nlc-ai/api-types';
import { UpdateProfileDto } from './dto';

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getProfile(userType: UserType, id: string) {
    let profile;

    switch (userType) {
      case UserType.coach:
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

      case UserType.client:
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

      case UserType.admin:
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
      case UserType.coach:
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

      case UserType.client:
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

      case UserType.admin:
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
}
