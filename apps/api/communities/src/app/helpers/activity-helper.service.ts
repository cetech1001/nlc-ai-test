import {Injectable} from "@nestjs/common";
import {PrismaService} from "@nlc-ai/api-database";
import {UserType} from "@nlc-ai/types";

@Injectable()
export class ActivityHelperService {
  constructor(private readonly prisma: PrismaService) {
  }

  async updateLastActivity(communityID: string, userID: string, userType: UserType) {
    return await this.prisma.communityMember.update({
      where: {
        communityID_userID_userType: {
          communityID,
          userID,
          userType,
        },
      },
      data: {
        lastActiveAt: new Date(),
      }
    });
  }
}
