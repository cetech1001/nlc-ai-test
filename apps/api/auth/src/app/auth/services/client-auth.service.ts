import {Injectable, ConflictException, UnauthorizedException, BadRequestException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { ValidatedGoogleUser, UserType } from '@nlc-ai/types';
import {
  AuthEvent,
  ClientRegistrationRequest,
  LoginRequest,
  UpdateProfileRequest
} from '@nlc-ai/api-types';
import {Client} from "@prisma/client";

@Injectable()
export class ClientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService,
  ) {}

  // STANDARDIZED LOGIN FLOW
  async login(loginDto: LoginRequest, provider?: 'google') {
    const { email, password } = loginDto;

    const client = await this.findClientByEmail(email);

    // Check if user exists
    if (!client) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!client.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if client has access to any coaches
    if (client.clientCoaches.length === 0) {
      throw new UnauthorizedException('No access to any coach');
    }

    // Validate authentication method
    if (provider === 'google') {
      if (client.provider !== 'google') {
        throw new UnauthorizedException({
          code: 'ACCOUNT_CONFLICT',
          message: 'Account exists with different authentication method',
        });
      }
    } else {
      // Email/password login
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

    // Check email verification
    if (!client.isVerified) {
      throw new UnauthorizedException({
        message: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
        email: email,
        requiresVerification: true,
      });
    }

    // Successful login - update last login
    await this.prisma.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateAuthResponse(client, false);
  }

  // STANDARDIZED REGISTRATION FLOW
  async register(registerDto: ClientRegistrationRequest, provider?: 'google', googleData?: ValidatedGoogleUser) {
    const { email, firstName, lastName, inviteToken } = registerDto;

    // Verify invite token
    const invite = await this.verifyInviteToken(email, inviteToken);
    const coachID = invite.coachID;

    // Check if client already exists globally
    const existingClient = await this.findClientByEmail(email);

    if (existingClient) {
      // Handle existing client connection to new coach
      return this.connectExistingClient(existingClient, coachID, invite);
    }

    // Create new client
    let clientData: any = {
      email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      source: 'invitation',
    };

    if (provider === 'google' && googleData) {
      // Google registration
      clientData = {
        ...clientData,
        provider: 'google',
        providerID: googleData.providerID,
        avatarUrl: googleData.avatarUrl,
        isVerified: true, // Google accounts are pre-verified
      };
    } else {
      // Email/password registration
      const { password } = registerDto;
      const passwordHash = await bcrypt.hash(password, 12);
      clientData = {
        ...clientData,
        passwordHash,
        isVerified: false,
      };
    }

    return this.prisma.$transaction(async (tx) => {
      // Create client
      const client = await tx.client.create({
        data: clientData,
      });

      // Create client-coach relationship
      await tx.clientCoach.create({
        data: {
          clientID: client.id,
          coachID: coachID,
          status: 'active',
          isPrimary: true,
          assignedBy: coachID,
        },
      });

      // Mark invite as used
      await tx.clientInvite.update({
        where: { id: invite.id },
        data: {
          usedAt: new Date(),
          usedBy: client.id,
        },
      });

      // Emit registration event
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
        // Auto-login for Google registration
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

  // GOOGLE AUTH ENTRY POINT
  async googleAuth(googleUser: ValidatedGoogleUser, inviteToken: string) {
    const existingClient = await this.findClientByEmail(googleUser.email);

    if (existingClient) {
      // Login existing client (will handle coach connection if needed)
      return this.handleExistingClientGoogleAuth(existingClient, inviteToken, googleUser);
    } else {
      // Register new client
      return this.register({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: '', // Not used for Google auth
        inviteToken,
      }, 'google', googleUser);
    }
  }

  // Add this method to ClientAuthService

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

    // Generate new token with updated coach context
    const payload = {
      sub: clientID,
      email: relationship.client.email,
      type: UserType.client,
      coachID: newCoachID,
      tenant: newCoachID,
    };

    // Emit context switch event
    await this.outbox.saveAndPublishEvent<AuthEvent>(
      {
        eventType: 'auth.client.coach.context.switched',
        schemaVersion: 1,
        payload: {
          clientID,
          newCoachID,
          clientEmail: relationship.client.email,
          newCoachName: `${relationship.coach.firstName} ${relationship.coach.lastName}`,
          newCoachBusinessName: relationship.coach.businessName,
          switchedAt: new Date().toISOString(),
        },
      },
      'auth.client.coach.context.switched'
    );

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

  async updateProfile(clientID: string, updateProfileDto: UpdateProfileRequest) {
    const { firstName, lastName, email } = updateProfileDto;

    const existingClient = await this.prisma.client.findFirst({
      where: {
        email,
        id: { not: clientID },
        isActive: true,
      },
    });

    if (existingClient) {
      throw new ConflictException('Email already exists');
    }

    const updatedClient = await this.prisma.client.update({
      where: { id: clientID },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phone: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user: updatedClient,
    };
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

  async uploadAvatar(clientID: string, avatarUrl: string) {
    await this.prisma.client.update({
      where: { id: clientID },
      data: { avatarUrl, updatedAt: new Date() },
    });
  }

  async findByUserID(id: string) {
    return this.prisma.client.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phone: true,
      },
    });
  }

  // HELPER METHODS
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

    // Create relationship
    await this.prisma.clientCoach.create({
      data: {
        clientID: existingClient.id,
        coachID: coachID,
        status: 'active',
        assignedBy: coachID,
      },
    });

    // Mark invite as used
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
    // Verify invite token
    const invite = await this.verifyInviteToken(googleUser.email, inviteToken);

    // Check provider match
    if (client.provider !== 'google' || client.providerID !== googleUser.providerID) {
      throw new UnauthorizedException({
        code: 'ACCOUNT_CONFLICT',
        message: 'Account exists with different authentication method',
      });
    }

    // Connect to coach if not already connected
    const hasConnection = client.clientCoaches.some((cc: any) => cc.coachID === invite.coachID);
    if (!hasConnection) {
      await this.connectExistingClient(client, invite.coachID, invite);
    }

    // Login the client
    return this.login({ email: client.email, password: '' }, 'google');
  }

  private async generateAuthResponse(client: any, isNewUser: boolean) {
    // Find primary coach or use first coach
    const primaryCoach = client.clientCoaches.find((cc: any) => cc.isPrimary)?.coach;
    const selectedCoach = primaryCoach || client.clientCoaches[0]?.coach;

    // Emit login event
    await this.outbox.saveAndPublishEvent<AuthEvent>(
      {
        eventType: 'auth.client.login',
        schemaVersion: 1,
        payload: {
          clientID: client.id,
          coachID: selectedCoach?.id,
          email: client.email,
          loginAt: new Date().toISOString(),
        },
      },
      'auth.client.login'
    );

    const payload = {
      sub: client.id,
      email: client.email,
      type: UserType.client,
      coachID: selectedCoach?.id,
      tenant: selectedCoach?.id,
      coaches: client.clientCoaches.map((cc: any) => cc.coachID),
    };

    return {
      access_token: this.jwtService.sign(payload),
      client: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        avatarUrl: client.avatarUrl,
        isActive: client.isActive,
        lastLoginAt: client.lastLoginAt,
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
          businessName: selectedCoach?.businessName,
          customDomain: selectedCoach?.customDomain,
        },
      },
      isNewUser,
    };
  }
}
