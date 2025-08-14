import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { ValidatedGoogleUser, UserType } from '@nlc-ai/types';
import {AuthEvent, ClientRegistrationRequest, LoginRequest} from "@nlc-ai/api-types";

@Injectable()
export class ClientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService,
  ) {}

  async registerClient(registerDto: ClientRegistrationRequest) {
    const { email, password, firstName, lastName, inviteToken, provider, providerID, avatarUrl } = registerDto;

    // Verify invite token
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

    const coachID = invite.coachID;

    // Check if client already exists globally
    const existingClient = await this.prisma.client.findUnique({
      where: { email },
      include: {
        clientCoaches: {
          where: { coachID },
          include: { coach: { select: { firstName: true, lastName: true } } }
        }
      }
    });

    if (existingClient) {
      // Client exists globally - check if already connected to this coach
      const existingRelationship = existingClient.clientCoaches.find(cc => cc.coachID === coachID);

      if (existingRelationship) {
        throw new ConflictException(`Client is already connected to coach ${invite.coach.firstName} ${invite.coach.lastName}`);
      }

      // Client exists but not connected to this coach - create relationship
      await this.prisma.clientCoach.create({
        data: {
          clientID: existingClient.id,
          coachID: coachID,
          status: 'active',
          assignedBy: coachID, // Coach invited them
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

    // Create new client with transaction
    return this.prisma.$transaction(async (tx) => {
      const passwordHash = password ? await bcrypt.hash(password, 12) : null;

      // Create client
      const client = await tx.client.create({
        data: {
          email,
          passwordHash,
          provider,
          providerID,
          firstName,
          lastName,
          avatarUrl,
          source: 'invitation',
          isVerified: provider === 'google',
        },
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

      // Emit client registered event
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

      return {
        message: 'Registration successful',
        clientID: client.id,
        requiresVerification: !client.isVerified,
      };
    });
  }

  async loginClient(loginDto: LoginRequest) {
    const { email, password } = loginDto;

    const client = await this.prisma.client.findUnique({
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

    if (!client || client.clientCoaches.length === 0) {
      throw new UnauthorizedException('Invalid credentials or no access to any coach');
    }

    // Validate password for email/password auth
    if (client.provider === null && password) {
      if (!client.passwordHash) {
        throw new UnauthorizedException('Password not set for this account');
      }

      const isPasswordValid = await bcrypt.compare(password, client.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (!client.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    await this.prisma.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    // Find primary coach or use first coach
    const primaryCoach = client.clientCoaches.find(cc => cc.isPrimary)?.coach;
    const selectedCoach = primaryCoach || client.clientCoaches[0]?.coach;

    // Emit client login event
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
      coaches: client.clientCoaches.map(cc => cc.coachID), // All accessible coaches
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
        coaches: client.clientCoaches.map(cc => ({
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
    };
  }

  // Google OAuth for clients
  async googleClientAuth(googleUser: ValidatedGoogleUser, inviteToken: string) {
    // Verify invite token first
    const invite = await this.prisma.clientInvite.findFirst({
      where: {
        token: inviteToken,
        email: googleUser.email,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
    });

    if (!invite) {
      throw new UnauthorizedException('Invalid or expired invitation');
    }

    let client = await this.prisma.client.findUnique({
      where: { email: googleUser.email },
      include: {
        clientCoaches: {
          where: { coachID: invite.coachID },
          include: { coach: true },
        },
      },
    });

    if (client) {
      // Existing client - verify provider match
      if (client.provider !== 'google' || client.providerID !== googleUser.providerID) {
        throw new UnauthorizedException('Account exists with different authentication method');
      }

      // If no relationship exists with this coach, create it
      if (!client.clientCoaches.some(cc => cc.coachID === invite.coachID)) {
        await this.prisma.clientCoach.create({
          data: {
            clientID: client.id,
            coachID: invite.coachID,
            status: 'active',
          },
        });
      }

      return this.loginClient({ email: client.email, password: '' });
    }

    // New client via Google OAuth
    return this.registerClient({
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      password: '',
      inviteToken,
      provider: 'google',
      providerID: googleUser.providerID,
      avatarUrl: googleUser.avatarUrl,
    });
  }

  // Helper method to switch coach context for existing client
  async switchCoachContext(clientID: string, newCoachID: string) {
    const relationship = await this.prisma.clientCoach.findUnique({
      where: {
        clientID_coachID: {
          clientID,
          coachID: newCoachID,
        },
      },
      include: {
        client: true,
        coach: true,
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

    return {
      access_token: this.jwtService.sign(payload),
      currentCoach: {
        coachID: relationship.coach.id,
        businessName: relationship.coach.businessName,
        customDomain: relationship.coach.customDomain,
      },
    };
  }
}
