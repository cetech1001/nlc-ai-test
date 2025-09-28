import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {PrismaService} from "@nlc-ai/api-database";
import {AuthUser, UserType} from "@nlc-ai/types";

@Injectable()
export class CoachClientAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.type === UserType.ADMIN) {
      return true;
    }

    if (user.type === UserType.COACH) {
      const clientID = request.params.id || request.params.clientID || request.query.clientID;

      if (clientID) {
        const hasAccess = await this.prisma.clientCoach.findFirst({
          where: {
            clientID,
            coachID: user.id,
            status: 'active',
          },
        });

        if (!hasAccess) {
          throw new ForbiddenException('Access denied to this client');
        }
      }
    }

    if (user.type === UserType.CLIENT) {
      const clientID = request.params.id || request.params.clientID;

      if (clientID && clientID !== user.id) {
        throw new ForbiddenException('Clients can only access their own data');
      }
    }

    return true;
  }
}
