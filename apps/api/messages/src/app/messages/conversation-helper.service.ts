import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {UserType, ConversationType, ConversationParticipant} from '@nlc-ai/types';

@Injectable()
export class ConversationHelperService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Determines the conversation type based on participant types
   */
  getConversationType(participantTypes: UserType[]): ConversationType {
    const types = participantTypes.sort();

    if (types.length === 1 && types[0] === UserType.COACH) {
      return 'coach_to_admin';
    }

    if (types.includes(UserType.ADMIN)) {
      return 'coach_to_admin';
    }

    if (types.includes(UserType.COACH) && types.includes(UserType.CLIENT)) {
      return 'client_to_coach';
    }

    if (types.every(t => t === UserType.COACH)) {
      return 'coach_to_coach';
    }

    if (types.every(t => t === UserType.CLIENT)) {
      return 'client_to_client';
    }

    throw new BadRequestException('Invalid participant combination');
  }

  /**
   * Gets all available admins (active) for notifications or assignment
   */
  async getAvailableAdmins(): Promise<{ id: string; name: string }[]> {
    const admins = await this.prisma.admin.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!admins || admins.length === 0) {
      return [];
    }

    return admins.map(admin => ({
      id: admin.id,
      name: `${admin.firstName} ${admin.lastName}`,
    }));
  }

  /**
   * Validates if a user can create/participate in a conversation
   */
  async validateConversationAccess(
    participantIDs: string[],
    participantTypes: UserType[],
    initiatorID: string,
    initiatorType: UserType,
  ): Promise<void> {
    const conversationType = this.getConversationType(participantTypes);

    switch (conversationType) {
      case 'coach_to_admin':
        // Only coaches can initiate admin conversations
        if (initiatorType !== UserType.COACH) {
          throw new ForbiddenException('Only coaches can contact admin support');
        }
        break;

      case 'client_to_coach':
        // Client can only message their own coach
        if (initiatorType === UserType.CLIENT) {
          await this.validateClientCoachRelationship(initiatorID, participantIDs, participantTypes);
        }
        break;

      case 'client_to_client':
        // Clients can only message other clients of the same coach
        await this.validateClientPeerRelationship(initiatorID, participantIDs);
        break;

      case 'coach_to_coach':
        // Any coach can message any coach
        break;

      default:
        throw new BadRequestException('Invalid conversation type');
    }
  }

  /**
   * Validates that a client is messaging their own coach
   */
  private async validateClientCoachRelationship(
    clientID: string,
    participantIDs: string[],
    participantTypes: UserType[],
  ): Promise<void> {
    const coachID = participantIDs[participantTypes.indexOf(UserType.COACH)];

    const relationship = await this.prisma.clientCoach.findFirst({
      where: {
        clientID,
        coachID,
        status: 'active',
      },
    });

    if (!relationship) {
      throw new ForbiddenException('You can only message your assigned coach');
    }
  }

  /**
   * Validates that clients share the same coach
   */
  private async validateClientPeerRelationship(
    initiatorClientID: string,
    participantIDs: string[],
  ): Promise<void> {
    // Get all client IDs (including initiator)
    const allClientIDs = [initiatorClientID, ...participantIDs.filter(id => id !== initiatorClientID)];

    // Get coaches for each client
    const clientCoaches = await this.prisma.clientCoach.findMany({
      where: {
        clientID: { in: allClientIDs },
        status: 'active',
      },
      select: {
        clientID: true,
        coachID: true,
      },
    });

    // Group by client to get their coaches
    const clientCoachMap = new Map<string, Set<string>>();
    clientCoaches.forEach(({ clientID, coachID }) => {
      if (!clientCoachMap.has(clientID)) {
        clientCoachMap.set(clientID, new Set());
      }
      clientCoachMap.get(clientID)!.add(coachID);
    });

    // Find common coaches
    const initiatorCoaches = clientCoachMap.get(initiatorClientID);
    if (!initiatorCoaches || initiatorCoaches.size === 0) {
      throw new ForbiddenException('You must have an assigned coach to message other clients');
    }

    // Check if all clients share at least one coach
    for (const clientID of participantIDs) {
      const clientCoaches = clientCoachMap.get(clientID);
      if (!clientCoaches || clientCoaches.size === 0) {
        throw new ForbiddenException('All participants must have an assigned coach');
      }

      const hasCommonCoach = Array.from(initiatorCoaches).some(coachID =>
        clientCoaches.has(coachID)
      );

      if (!hasCommonCoach) {
        throw new ForbiddenException('You can only message clients who share your coach');
      }
    }
  }

  /**
   * Gets display info for a participant
   */
  async getParticipantInfo(userID: string, userType: UserType): Promise<ConversationParticipant> {
    switch (userType) {
      case UserType.COACH: {
        const coach = await this.prisma.coach.findUnique({
          where: { id: userID },
          select: { firstName: true, lastName: true, businessName: true, avatarUrl: true },
        });

        return {
          id: userID,
          type: UserType.COACH,
          name: coach?.businessName || `${coach?.firstName} ${coach?.lastName}` || 'Unknown Coach',
          avatarUrl: coach?.avatarUrl || undefined,
        };
      }

      case UserType.CLIENT: {
        const client = await this.prisma.client.findUnique({
          where: { id: userID },
          select: { firstName: true, lastName: true, avatarUrl: true },
        });

        return {
          id: userID,
          type: UserType.CLIENT,
          name: `${client?.firstName} ${client?.lastName}`,
          avatarUrl: client?.avatarUrl || undefined,
        };
      }

      case UserType.ADMIN: {
        const admin = await this.prisma.admin.findUnique({
          where: { id: userID },
          select: { firstName: true, lastName: true },
        });

        return {
          id: userID,
          type: UserType.ADMIN,
          name: `${admin?.firstName} ${admin?.lastName}`,
          avatarUrl: undefined,
        };
      }

      default:
        throw new BadRequestException('Invalid user type');
    }
  }

  /**
   * Gets admin assignment from conversation metadata
   */
  getAssignedAdmin(conversation: any): { adminID?: string; adminName?: string } | null {
    if (!conversation.metadata) return null;

    const metadata = typeof conversation.metadata === 'string'
      ? JSON.parse(conversation.metadata)
      : conversation.metadata;

    return {
      adminID: metadata.assignedAdminID,
      adminName: metadata.assignedAdminName,
    };
  }

  /**
   * Sets admin assignment in conversation metadata
   */
  createAdminAssignmentMetadata(adminID: string, adminName: string, previousMetadata?: any): any {
    const existingMetadata = previousMetadata || {};

    return {
      ...existingMetadata,
      assignedAdminID: adminID,
      assignedAdminName: adminName,
      assignedAt: new Date().toISOString(),
      handoffCount: (existingMetadata.handoffCount || 0),
    };
  }

  getParticipantType(conversationType: ConversationType, senderType: UserType) {
    switch (conversationType) {
      case 'coach_to_coach':
        return UserType.COACH;
      case 'client_to_client':
        return UserType.CLIENT;
      case 'client_to_coach':
        return senderType === UserType.CLIENT ? UserType.COACH : UserType.CLIENT;
      case 'coach_to_admin':
        return senderType === UserType.ADMIN ? UserType.COACH : UserType.ADMIN;
      default:
        throw new BadRequestException('Invalid conversation type');
    }
  }

  /**
   * Checks if user is participant in conversation
   */
  isParticipant(conversation: any, userID: string, userType: UserType): boolean {
    // Special handling for admin - check if admin is assigned in metadata
    if (userType === UserType.ADMIN) {
      const conversationType = this.getConversationType(conversation.participantTypes as UserType[]);

      if (conversationType === 'coach_to_admin') {
        const assignedAdmin = this.getAssignedAdmin(conversation);

        // Admin can access if they are assigned, or if no admin is assigned yet
        return !assignedAdmin?.adminID || assignedAdmin.adminID === userID;
      }

      return false;
    }

    return conversation.participantIDs.includes(userID) && conversation.participantTypes.includes(userType);
  }

  /**
   * Gets an available admin for assignment (simple round-robin for now)
   */
  async getAvailableAdmin(): Promise<{ id: string; name: string } | null> {
    const admin = await this.prisma.admin.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true
      },
    });

    if (!admin) return null;

    return {
      id: admin.id,
      name: `${admin.firstName} ${admin.lastName}`,
    };
  }
}
