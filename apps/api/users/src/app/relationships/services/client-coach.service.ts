import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { CreateRelationshipDto, UpdateRelationshipDto, RelationshipQueryDto } from '../dto';
import {UserEvent} from "@nlc-ai/api-types";

@Injectable()
export class ClientCoachService {
  constructor(
    private prisma: PrismaService,
    private outbox: OutboxService,
  ) {}

  async create(createRelationshipDto: CreateRelationshipDto, coachID: string, assignedBy: string) {
    const { clientID, role = 'client', notes } = createRelationshipDto;

    // Check if relationship already exists
    const existingRelationship = await this.prisma.clientCoach.findUnique({
      where: {
        clientID_coachID: {
          clientID,
          coachID,
        }
      }
    });

    if (existingRelationship) {
      throw new ConflictException('Relationship already exists between this client and coach');
    }

    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientID }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const relationship = await this.prisma.clientCoach.create({
      data: {
        clientID,
        coachID,
        role,
        notes,
        assignedBy,
        status: 'active',
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        coach: {
          select: {
            firstName: true,
            lastName: true,
            businessName: true,
          }
        }
      },
    });

    // Emit relationship created event
    await this.outbox.saveAndPublishEvent<UserEvent>(
      {
        eventType: 'auth.client.connected',
        schemaVersion: 1,
        payload: {
          relationshipID: relationship.id,
          clientID,
          coachID,
          email: relationship.client.email,
          connectedBy: assignedBy,
        },
      },
      'auth.client.connected'
    );

    return relationship;
  }

  async findAll(query: RelationshipQueryDto, coachID?: string) {
    const { page = 1, limit = 10, status, clientID, role } = query;

    const where: any = {};

    if (coachID) {
      where.coachID = coachID;
    }

    if (status) {
      where.status = status;
    }

    if (clientID) {
      where.clientID = clientID;
    }

    if (role) {
      where.role = role;
    }

    const result = await this.prisma.paginate(this.prisma.clientCoach, {
      page,
      limit,
      where,
      orderBy: { assignedAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            isActive: true,
            lastInteractionAt: true,
          }
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            avatarUrl: true,
          }
        }
      },
    });

    return {
      data: result.data,
      pagination: result.pagination,
    };
  }

  async findOne(id: string, coachID?: string) {
    const where: any = { id };

    if (coachID) {
      where.coachID = coachID;
    }

    const relationship = await this.prisma.clientCoach.findFirst({
      where,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            phone: true,
            isActive: true,
            lastInteractionAt: true,
            createdAt: true,
          }
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            avatarUrl: true,
          }
        }
      },
    });

    if (!relationship) {
      throw new NotFoundException(`Relationship with ID ${id} not found`);
    }

    return relationship;
  }

  async update(id: string, updateRelationshipDto: UpdateRelationshipDto, updatedBy: string) {
    const relationship = await this.findOne(id);

    const updatedRelationship = await this.prisma.clientCoach.update({
      where: { id },
      data: {
        ...updateRelationshipDto,
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            avatarUrl: true,
          }
        }
      },
    });

    // Emit relationship updated event
    await this.outbox.saveAndPublishEvent<UserEvent>(
      {
        eventType: 'auth.client.relationship.updated',
        schemaVersion: 1,
        payload: {
          relationshipID: id,
          clientID: relationship.clientID,
          coachID: relationship.coachID,
          changes: updateRelationshipDto,
          updatedBy,
        },
      },
      'auth.client.relationship.updated'
    );

    return updatedRelationship;
  }

  async remove(id: string, removedBy: string) {
    const relationship = await this.findOne(id);

    await this.prisma.clientCoach.update({
      where: { id },
      data: {
        status: 'inactive',
        updatedAt: new Date(),
      },
    });

    // Emit relationship removed event
    await this.outbox.saveAndPublishEvent<UserEvent>(
      {
        eventType: 'auth.client.relationship.removed',
        schemaVersion: 1,
        payload: {
          relationshipID: id,
          clientID: relationship.clientID,
          coachID: relationship.coachID,
          removedBy,
        },
      },
      'auth.client.relationship.removed'
    );

    return { message: 'Relationship removed successfully' };
  }
}
