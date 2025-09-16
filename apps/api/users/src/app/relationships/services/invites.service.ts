import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { CreateInviteDto, InviteQueryDto } from '../dto';
import { v4 as uuid } from 'uuid';
import {UserEvent} from "@nlc-ai/api-types";

@Injectable()
export class InvitesService {
  constructor(
    private prisma: PrismaService,
    private outbox: OutboxService,
  ) {}

  async findAll(query: InviteQueryDto, coachID?: string) {
    const { page = 1, limit = 10, status, email } = query;

    const where: any = {};

    if (coachID) {
      where.coachID = coachID;
    }

    if (status === 'pending') {
      where.usedAt = null;
      where.expiresAt = { gt: new Date() };
    } else if (status === 'used') {
      where.usedAt = { not: null };
    } else if (status === 'expired') {
      where.usedAt = null;
      where.expiresAt = { lte: new Date() };
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    const result = await this.prisma.paginate(this.prisma.clientInvite, {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
          }
        }
      },
    });

    return {
      data: result.data.map((invite: any) => ({
        ...invite,
        status: this.getInviteStatus(invite),
      })),
      pagination: result.pagination,
    };
  }

  async findOne(id: string, coachID?: string) {
    const where: any = { id };

    if (coachID) {
      where.coachID = coachID;
    }

    const invite = await this.prisma.clientInvite.findFirst({
      where,
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
          }
        }
      },
    });

    if (!invite) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    return {
      ...invite,
      status: this.getInviteStatus(invite),
    };
  }

  async create(createInviteDto: CreateInviteDto, coachID: string) {
    const { email, role = 'client', message } = createInviteDto;

    const existingInvite = await this.prisma.clientInvite.findFirst({
      where: {
        coachID,
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      }
    });

    if (existingInvite) {
      throw new ConflictException('An active invitation already exists for this email');
    }

    const existingClient = await this.prisma.client.findUnique({
      where: { email },
      include: {
        clientCoaches: {
          where: { coachID, status: 'active' }
        }
      }
    });

    if (existingClient && existingClient.clientCoaches.length > 0) {
      throw new ConflictException('Client is already connected to this coach');
    }

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: {
        firstName: true,
        lastName: true,
        businessName: true,
      }
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    const token = uuid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.clientInvite.create({
      data: {
        coachID,
        email,
        token,
        role,
        message,
        expiresAt,
      },
    });

    await this.outbox.saveAndPublishEvent<UserEvent>(
      {
        eventType: 'auth.client.invited',
        schemaVersion: 1,
        payload: {
          inviteID: invite.id,
          coachID,
          email,
          coachName: `${coach.firstName} ${coach.lastName}`,
          businessName: coach.businessName,
          token,
          message,
          expiresAt: expiresAt.toISOString(),
        },
      },
      'auth.client.invited'
    );

    return {
      ...invite,
      status: 'pending',
    };
  }

  async resend(id: string, coachID?: string) {
    const invite = await this.findOne(id, coachID);

    if (invite.usedAt) {
      throw new ConflictException('Cannot resend a used invitation');
    }

    // Update expiration date
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const updatedInvite = await this.prisma.clientInvite.update({
      where: { id },
      data: {
        expiresAt: newExpiresAt,
      },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
            businessName: true,
          }
        }
      },
    });

    // Emit resend event
    await this.outbox.saveAndPublishEvent<UserEvent>(
      {
        eventType: 'auth.client.invited',
        schemaVersion: 1,
        payload: {
          inviteID: invite.id,
          coachID: invite.coachID,
          email: invite.email,
          coachName: `${updatedInvite.coach.firstName} ${updatedInvite.coach.lastName}`,
          businessName: updatedInvite.coach.businessName,
          token: invite.token,
          message: invite.message,
          expiresAt: newExpiresAt.toISOString(),
        },
      },
      'auth.client.invited'
    );

    return {
      message: 'Invitation resent successfully',
      expiresAt: newExpiresAt,
    };
  }

  async remove(id: string, coachID?: string) {
    const invite = await this.findOne(id, coachID);

    if (invite.usedAt) {
      throw new ConflictException('Cannot cancel a used invitation');
    }

    await this.prisma.clientInvite.delete({
      where: { id },
    });

    return { message: 'Invitation cancelled successfully' };
  }

  private getInviteStatus(invite: any): string {
    if (invite.usedAt) {
      return 'used';
    }

    if (new Date() > invite.expiresAt) {
      return 'expired';
    }

    return 'pending';
  }
}
