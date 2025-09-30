import {Injectable, ConflictException, UnauthorizedException, BadRequestException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {
  AuthEvent,
  ClientRegistrationRequest,
  LoginRequest,
  ValidatedGoogleUser,
  UserType
} from '@nlc-ai/types';
import {Client} from "@prisma/client";
import {AuthResponse} from "@nlc-ai/types";

@Injectable()
export class ClientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginRequest, provider?: 'google') {
    const { email, password } = loginDto;

    const client = await this.findClientByEmail(email);

    if (!client) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!client.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (client.clientCoaches.length === 0) {
      throw new UnauthorizedException('No access to any coach');
    }

    if (provider === 'google') {
      if (client.provider !== 'google') {
        throw new UnauthorizedException({
          code: 'ACCOUNT_CONFLICT',
          message: 'Account exists with different authentication method',
        });
      }
    } else {
      if (client.provider && !client.passwordHash) {
        throw new UnauthorizedException({
          code: 'ACCOUNT_CONFLICT',
          message: 'Account exists with different authentication method',
        });
      }

      if (!client.passwordHash) {
        throw new UnauthorizedException('Password not set for this account');
      }

      const isPasswordValid = await bcrypt.compare(password, client.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (!client.isVerified) {
      throw new UnauthorizedException({
        message: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
        email: email,
        requiresVerification: true,
      });
    }

    await this.prisma.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateAuthResponse(client, false);
  }

  async register(registerDto: ClientRegistrationRequest, provider?: 'google', googleData?: ValidatedGoogleUser) {
    const { email, firstName, lastName, inviteToken } = registerDto;

    const invite = await this.verifyInviteToken(email, inviteToken);
    const coachID = invite.coachID;

    const existingClient = await this.findClientByEmail(email);

    if (existingClient) {
      return this.connectExistingClient(existingClient, coachID, invite);
    }

    let clientData: any = {
      email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      source: 'invitation',
    };

    if (provider === 'google' && googleData) {
      clientData = {
        ...clientData,
        provider: 'google',
        providerID: googleData.providerID,
        avatarUrl: googleData.avatarUrl,
        isVerified: true,
      };
    } else {
      const { password } = registerDto;
      const passwordHash = await bcrypt.hash(password, 12);
      clientData = {
        ...clientData,
        passwordHash,
        isVerified: false,
      };
    }

    return this.prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: clientData,
      });

      await tx.clientCoach.create({
        data: {
          clientID: client.id,
          coachID: coachID,
          status: 'active',
          isPrimary: true,
          assignedBy: coachID,
        },
      });

      await tx.clientInvite.update({
        where: { id: invite.id },
        data: {
          usedAt: new Date(),
          usedBy: client.id,
        },
      });

      await this.outbox.saveAndPublishEvent<AuthEvent>(
        {
          eventType: 'auth.client.registered',
          schemaVersion: 1,
          payload: {
            clientID: client.id,
            coachID: coachID,
            email: client.email,
            firstName: client.firstName,
            lastName: client.lastName,
            provider,
          },
        },
        'auth.client.registered'
      );

      if (provider === 'google') {
        const clientWithCoaches = await this.findClientByEmail(email);
        return this.generateAuthResponse(clientWithCoaches!, true);
      }

      return {
        message: 'Registration successful',
        clientID: client.id,
        requiresVerification: !client.isVerified,
      };
    });
  }

  async googleAuth(googleUser: ValidatedGoogleUser, inviteToken: string) {
    const existingClient = await this.findClientByEmail(googleUser.email);

    if (existingClient) {
      return this.handleExistingClientGoogleAuth(existingClient, inviteToken, googleUser);
    } else {
      return this.register({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: '',
        inviteToken,
      }, 'google', googleUser);
    }
  }

  async switchCoachContext(clientID: string, newCoachID: string) {
    const relationship = await this.prisma.clientCoach.findUnique({
      where: {
        clientID_coachID: {
          clientID,
          coachID: newCoachID,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            customDomain: true,
          }
        },
      },
    });

    if (!relationship || relationship.status !== 'active') {
      throw new UnauthorizedException('No access to specified coach');
    }

    const payload = {
      sub: clientID,
      email: relationship.client.email,
      type: UserType.CLIENT,
      coachID: newCoachID,
      tenant: newCoachID,
    };

    return {
      access_token: this.jwtService.sign(payload),
      currentCoach: {
        coachID: relationship.coach.id,
        coachName: `${relationship.coach.firstName} ${relationship.coach.lastName}`,
        businessName: relationship.coach.businessName,
        customDomain: relationship.coach.customDomain,
      },
      message: 'Coach context switched successfully',
    };
  }

  async verifyEmail(client: Client) {
    const updatedClient = await this.prisma.client.update({
      where: { id: client.id },
      data: {
        isVerified: true,
        lastLoginAt: new Date(),
      },
      include: {
        clientCoaches: {
          where: { status: 'active' },
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                businessName: true,
                customDomain: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return this.generateAuthResponse(updatedClient, false);
  }

  async updatePassword(passwordHash: string, clientID?: string, email?: string) {
    if (clientID || email) {
      await this.prisma.client.update({
        where: { id: clientID, email },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });

      return { message: 'Password updated successfully' };
    }
    throw new BadRequestException('Could not identify user');
  }

  private async findClientByEmail(email: string) {
    return this.prisma.client.findUnique({
      where: { email, isActive: true },
      include: {
        clientCoaches: {
          where: { status: 'active' },
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                businessName: true,
                customDomain: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  private async verifyInviteToken(email: string, inviteToken: string) {
    const invite = await this.prisma.clientInvite.findFirst({
      where: {
        token: inviteToken,
        email,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: {
        coach: {
          select: { id: true, firstName: true, lastName: true, isActive: true, isDeleted: true }
        }
      }
    });

    if (!invite || !invite.coach.isActive || invite.coach.isDeleted) {
      throw new UnauthorizedException('Invalid or expired invitation');
    }

    return invite;
  }

  private async connectExistingClient(existingClient: any, coachID: string, invite: any) {
    const existingRelationship = existingClient.clientCoaches.find((cc: any) => cc.coachID === coachID);

    if (existingRelationship) {
      throw new ConflictException(`Client is already connected to coach ${invite.coach.firstName} ${invite.coach.lastName}`);
    }

    await this.prisma.clientCoach.create({
      data: {
        clientID: existingClient.id,
        coachID: coachID,
        status: 'active',
        assignedBy: coachID,
      },
    });

    await this.prisma.clientInvite.update({
      where: { id: invite.id },
      data: {
        usedAt: new Date(),
        usedBy: existingClient.id,
      },
    });

    return {
      message: 'Client connected to coach successfully',
      clientID: existingClient.id,
      isExistingClient: true,
    };
  }

  private async handleExistingClientGoogleAuth(client: any, inviteToken: string, googleUser: ValidatedGoogleUser) {
    const invite = await this.verifyInviteToken(googleUser.email, inviteToken);

    if (client.provider !== 'google' || client.providerID !== googleUser.providerID) {
      throw new UnauthorizedException({
        code: 'ACCOUNT_CONFLICT',
        message: 'Account exists with different authentication method',
      });
    }

    const hasConnection = client.clientCoaches.some((cc: any) => cc.coachID === invite.coachID);
    if (!hasConnection) {
      await this.connectExistingClient(client, invite.coachID, invite);
    }

    return this.login({ email: client.email, password: '' }, 'google');
  }

  private async generateAuthResponse(client: any, isNewUser: boolean): Promise<AuthResponse> {
    const primaryCoach = client.clientCoaches.find((cc: any) => cc.isPrimary)?.coach;
    const selectedCoach = primaryCoach || client.clientCoaches[0]?.coach;

    const payload = {
      sub: client.id,
      id: client.id,
      name: client.firstName + ' ' + client.lastName,
      email: client.email,
      type: UserType.CLIENT,
      coachID: selectedCoach?.id,
      tenant: selectedCoach?.id,
      coaches: client.clientCoaches.map((cc: any) => cc.coachID),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: client.id,
        type: UserType.CLIENT,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        avatarUrl: client.avatarUrl,
        isActive: client.isActive,
        createdAt: client.createdAt,
        coaches: client.clientCoaches.map((cc: any) => ({
          coachID: cc.coach.id,
          coachName: `${cc.coach.firstName} ${cc.coach.lastName}`,
          businessName: cc.coach.businessName,
          isPrimary: cc.isPrimary,
          status: cc.status,
        })),
        currentCoach: {
          coachID: selectedCoach?.id,
          coachName: `${selectedCoach.coach.firstName} ${selectedCoach.coach.lastName}`,
          businessName: selectedCoach?.businessName,
        },
      },
      isNewUser,
    };
  }
}
