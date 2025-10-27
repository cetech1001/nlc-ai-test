import {BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException,} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {MessageType, MESSAGING_ROUTING_KEYS, MessagesEvent, UserType} from '@nlc-ai/types';
import {OutboxService} from '@nlc-ai/api-messaging';
import {
  ConversationFiltersDto,
  CreateConversationDto,
  CreateMessageDto,
  MessageFiltersDto,
  UpdateMessageDto,
} from './dto';
import {MessagesGateway} from '../websocket/messages.gateway';
import {ConversationHelperService} from "./conversation-helper.service";
import {Prisma} from "@prisma/client";

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
    private readonly outboxService: OutboxService,
    private readonly conversationHelper: ConversationHelperService,
  ) {}

  async createConversation(
    createDto: CreateConversationDto,
    userID: string,
    userType: UserType
  ) {
    try {
      // Add initiator if not included (non-admin users)
      if (userType !== UserType.ADMIN && !createDto.participantIDs.includes(userID)) {
        createDto.participantIDs.push(userID);
        createDto.participantTypes.push(userType);
      }

      // Special handling for admin conversations
      const conversationType = this.conversationHelper.getConversationType(createDto.participantTypes);
      const metadata: any = {};

      if (conversationType === 'coach_to_admin') {
        // Don't add admin to participantIDs yet - only the coach is a participant at creation
        // Remove admin from participants if accidentally added
        const adminIndex = createDto.participantTypes.indexOf(UserType.ADMIN);
        if (adminIndex !== -1) {
          createDto.participantIDs.splice(adminIndex, 1);
          createDto.participantTypes.splice(adminIndex, 1);
        }

        // Mark in metadata that this conversation needs admin assignment
        metadata.pendingAdminAssignment = true;
        metadata.createdAt = new Date().toISOString();
      } else {
        // Validate conversation type and access for non-admin conversations
        await this.conversationHelper.validateConversationAccess(
          createDto.participantIDs,
          createDto.participantTypes,
          userID,
          userType,
        );
      }

      if (createDto.type === 'direct' && createDto.participantIDs.length !== 2 && conversationType !== 'coach_to_admin') {
        throw new BadRequestException('Direct conversations must have exactly 2 participants');
      }

      // Check for existing conversation (including admin conversations)
      if (createDto.type === 'direct') {
        const existingConversation = await this.findExistingDirectConversation(
          createDto.participantIDs,
          createDto.participantTypes,
          conversationType
        );
        if (existingConversation) {
          return existingConversation;
        }
      }

      // Generate conversation name if not provided
      let conversationName = createDto.name;
      if (!conversationName && createDto.type === 'direct') {
        if (conversationType === 'coach_to_admin') {
          conversationName = 'Admin Support';
        } else {
          // Get the other participant's name
          const otherParticipantIndex = createDto.participantIDs[0] === userID ? 1 : 0;
          const otherParticipant = await this.conversationHelper.getParticipantInfo(
            createDto.participantIDs[otherParticipantIndex],
            createDto.participantTypes[otherParticipantIndex] as UserType,
          );
          conversationName = otherParticipant.name;
        }
      }

      const conversation = await this.prisma.conversation.create({
        data: {
          type: createDto.type,
          name: conversationName,
          participantIDs: createDto.participantIDs,
          participantTypes: createDto.participantTypes,
          unreadCount: this.initializeUnreadCount(createDto.participantIDs, createDto.participantTypes),
          metadata,
        },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      const { name: creatorName } = await this.getUserName(userID, userType);

      await this.outboxService.saveAndPublishEvent<MessagesEvent>({
        eventType: 'messages.conversation.created',
        schemaVersion: 1,
        payload: {
          conversationID: conversation.id,
          type: conversation.type as 'direct' | 'group',
          conversationType,
          name: conversation.name,
          participantIDs: conversation.participantIDs,
          participantTypes: conversation.participantTypes as UserType[],
          creatorID: userID,
          creatorType: userType,
          creatorName,
          createdAt: conversation.createdAt.toISOString(),
        },
      }, MESSAGING_ROUTING_KEYS.CONVERSATION_CREATED);

      this.logger.log(`Conversation created: ${conversation.id} (${conversationType})`);
      return conversation;
    } catch (error) {
      this.logger.error('Failed to create conversation', error);
      throw error;
    }
  }

  async getConversations(
    filters: ConversationFiltersDto,
    userID: string,
    userType: UserType
  ) {
    let where: any;

    if (userType === UserType.ADMIN) {
      // Admins see conversations where they are assigned in metadata
      where = {
        metadata: {
          path: ['assignedAdminID'],
          equals: userID,
        },
      };
    } else {
      // Regular users see their own conversations
      where = {
        participantIDs: { has: userID },
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.unreadOnly) {
      const userKey = `${userType}:${userID}`;
      where.unreadCount = {
        path: [userKey],
        gt: 0,
      };
    }

    return this.prisma.paginate(this.prisma.conversation, {
      page: filters.page,
      limit: filters.limit,
      where,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getConversation(conversationID: string, userID: string, userType: UserType) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!this.conversationHelper.isParticipant(conversation, userID, userType)) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    await this.resetUnreadCount(conversationID, userID, userType);

    return conversation;
  }

  async sendMessage(
    conversationID: string,
    createDto: CreateMessageDto,
    senderID: string,
    senderType: UserType,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!this.conversationHelper.isParticipant(conversation, senderID, senderType)) {
      throw new ForbiddenException('Not authorized to send messages in this conversation');
    }

    const { name: senderName, email: senderEmail } = await this.getUserName(senderID, senderType);
    const conversationType = this.conversationHelper.getConversationType(
      conversation.participantTypes as UserType[]
    );

    // Handle admin assignment for first admin reply
    let updatedMetadata = conversation.metadata || {};
    const updatedParticipantIDs = [...conversation.participantIDs];
    const updatedParticipantTypes = [...conversation.participantTypes];

    const assignedAdmin = this.conversationHelper.getAssignedAdmin(conversation);
    if (conversationType === 'coach_to_admin' && senderType === UserType.ADMIN) {

      if (!assignedAdmin?.adminID) {
        // First admin reply - assign this admin and add them as participant
        updatedMetadata = this.conversationHelper.createAdminAssignmentMetadata(
          senderID,
          senderName,
          updatedMetadata
        );

        // Add admin to participants
        updatedParticipantIDs.push(senderID);
        updatedParticipantTypes.push(UserType.ADMIN);

        this.logger.log(`Admin ${senderID} assigned to conversation ${conversationID}`);
      }
    }

    // Get sender avatar
    const senderAvatarUrl = await this.getUserAvatar(senderID, senderType);

    const message = await this.prisma.directMessage.create({
      data: {
        conversationID,
        senderID,
        senderType,
        senderName,
        senderAvatarUrl,
        type: createDto.type || MessageType.TEXT,
        content: createDto.content,
        mediaUrls: createDto.mediaUrls || [],
        fileUrl: createDto.fileUrl,
        fileName: createDto.fileName,
        fileSize: createDto.fileSize,
        replyToMessageID: createDto.replyToMessageID,
      },
      include: {
        replyToMessage: {
          select: {
            id: true,
            content: true,
            senderID: true,
            senderType: true,
            createdAt: true,
          },
        },
      },
    });

    const updatedUnreadCount = this.incrementUnreadCount(
      conversation.unreadCount as Record<string, number>,
      senderID,
      senderType,
      updatedParticipantIDs,
      updatedParticipantTypes as UserType[]
    );

    await this.prisma.conversation.update({
      where: { id: conversationID },
      data: {
        lastMessageID: message.id,
        lastMessageAt: new Date(),
        unreadCount: updatedUnreadCount,
        metadata: updatedMetadata,
        participantIDs: updatedParticipantIDs,
        participantTypes: updatedParticipantTypes,
      },
    });

    await this.messagesGateway.broadcastNewMessage(conversationID, message, conversation);

    // Send notifications and check presence
    for (let i = 0; i < updatedParticipantIDs.length; i++) {
      const participantID = updatedParticipantIDs[i];

      // Skip sender
      if (participantID === senderID) {
        continue;
      }

      const participantType = this.conversationHelper.getParticipantType(conversationType, senderType);

      const isRecipientViewing = this.messagesGateway.isUserViewingConversation(
        conversationID,
        participantID,
        participantType
      );

      // Check if recipient is online using Redis presence
      const isRecipientOnline = await this.messagesGateway.isUserOnline(participantID, participantType);

      if (!isRecipientViewing) {
        const { name: recipientName } = await this.getUserName(participantID, participantType);

        await this.outboxService.saveAndPublishEvent<MessagesEvent>({
          eventType: 'messages.message.created',
          schemaVersion: 1,
          payload: {
            messageID: message.id,
            conversationID,
            conversationType,
            senderID,
            senderType,
            senderName,
            recipientID: participantID,
            recipientType: participantType,
            recipientName,
            type: message.type as MessageType,
            content: message.content,
            isRead: false,
            createdAt: message.createdAt.toISOString(),
          },
        }, MESSAGING_ROUTING_KEYS.MESSAGE_CREATED);

        // Email notification if recipient is offline
        if (!isRecipientOnline) {
          await this.outboxService.saveAndPublishEvent({
            eventType: 'messages.notification.email',
            schemaVersion: 1,
            payload: {
              recipientID: participantID,
              recipientType: participantType,
              recipientName,
              senderID,
              senderType,
              senderName,
              messageID: message.id,
              conversationID,
              conversationType,
              senderEmail,
              messageContent: message.content,
              messageType: message.type,
              timestamp: new Date().toISOString(),
            },
          } as any, 'messages.notification.email');

          this.logger.log(`📧 Email notification queued for offline user: ${participantType}:${participantID}`);
        }
      }
    }

    if (!assignedAdmin?.adminID && conversationType === 'coach_to_admin' && senderType === UserType.COACH) {
      // Notify available admins, even though they’re not yet participants
      const availableAdmins = await this.conversationHelper.getAvailableAdmins();

      for (const admin of availableAdmins) {
        await this.outboxService.saveAndPublishEvent({
          eventType: 'messages.notification.email',
          schemaVersion: 1,
          payload: {
            recipientID: admin.id,
            recipientType: UserType.ADMIN,
            recipientName: admin.name,
            senderID,
            senderType,
            senderName,
            messageID: message.id,
            conversationID,
            conversationType,
            senderEmail,
            messageContent: message.content,
            messageType: message.type,
            timestamp: new Date().toISOString(),
          },
        } as any, 'messages.notification.email');
      }

      this.logger.log(`📧 Coach sent message — admin notified for pending assignment`);
    }

    this.logger.log(`Message sent: ${message.id} in conversation ${conversationID} (${conversationType})`);
    return message;
  }

  async getMessages(
    conversationID: string,
    filters: MessageFiltersDto,
    userID: string,
    userType: UserType
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!this.conversationHelper.isParticipant(conversation, userID, userType)) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const where: any = { conversationID };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      where.content = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.before) {
      where.createdAt = { lt: new Date(filters.before) };
    }

    if (filters.after) {
      where.createdAt = { gt: new Date(filters.after) };
    }

    return this.prisma.paginate(this.prisma.directMessage, {
      page: filters.page,
      limit: filters.limit,
      where,
      include: {
        replyToMessage: {
          select: {
            id: true,
            content: true,
            senderID: true,
            senderType: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async editMessage(
    messageID: string,
    updateDto: UpdateMessageDto,
    userID: string,
    userType: UserType
  ) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageID },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderID !== userID || message.senderType !== userType) {
      throw new ForbiddenException('Can only edit your own messages');
    }

    const updatedMessage = await this.prisma.directMessage.update({
      where: { id: messageID },
      data: {
        content: updateDto.content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    await this.messagesGateway.broadcastMessageUpdate(message.conversationID, updatedMessage);

    await this.outboxService.saveAndPublishEvent<MessagesEvent>({
      eventType: 'messages.message.updated',
      schemaVersion: 1,
      payload: {
        messageID,
        conversationID: message.conversationID,
        senderID: userID,
        senderType: userType,
        newContent: updateDto.content,
        editedAt: updatedMessage.editedAt!.toISOString(),
      },
    }, MESSAGING_ROUTING_KEYS.MESSAGE_UPDATED);

    this.logger.log(`Message edited: ${messageID}`);
    return updatedMessage;
  }

  async deleteMessage(messageID: string, userID: string, userType: UserType) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageID },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderID !== userID || message.senderType !== userType) {
      throw new ForbiddenException('Can only delete your own messages');
    }

    await this.prisma.directMessage.delete({
      where: { id: messageID },
    });

    await this.messagesGateway.broadcastMessageDelete(message.conversationID, messageID);

    await this.outboxService.saveAndPublishEvent<MessagesEvent>({
      eventType: 'messages.message.deleted',
      schemaVersion: 1,
      payload: {
        messageID,
        conversationID: message.conversationID,
        senderID: userID,
        senderType: userType,
        deletedAt: new Date().toISOString(),
      },
    }, MESSAGING_ROUTING_KEYS.MESSAGE_DELETED);

    this.logger.log(`Message deleted: ${messageID}`);
    return { message: 'Message deleted successfully' };
  }

  async markAsRead(messageIDs: string[], userID: string, userType: UserType) {
    await this.prisma.directMessage.updateMany({
      where: {
        id: { in: messageIDs },
        NOT: {
          senderID: userID,
          senderType: userType,
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const firstMessage = await this.prisma.directMessage.findFirst({
      where: { id: { in: messageIDs } },
      select: { conversationID: true },
    });

    if (firstMessage) {
      await this.messagesGateway.broadcastReadStatus(
        firstMessage.conversationID,
        messageIDs,
        userID,
        userType
      );

      await this.updateConversationUnreadCount(firstMessage.conversationID, userID, userType);
    }

    this.logger.log(`Messages marked as read: ${messageIDs.length} messages`);
    return { message: 'Messages marked as read' };
  }

  async getUnreadCount(conversationID: string, userID: string, userType: UserType) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!this.conversationHelper.isParticipant(conversation, userID, userType)) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const userKey = `${userType}:${userID}`;
    const unreadCount = (conversation.unreadCount as Record<string, number>)[userKey] || 0;

    return { unreadCount };
  }

  async createSupportConversation(coachID: string) {
    // Check for existing admin conversation for this coach
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        type: 'direct',
        participantIDs: { has: coachID },
        participantTypes: { has: UserType.COACH },
        metadata: {
          path: ['pendingAdminAssignment'],
          not: Prisma.JsonNull,
        },
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new admin conversation (only coach as participant initially)
    const conversation = await this.createConversation(
      {
        type: 'direct',
        name: 'Admin Support',
        participantIDs: [coachID],
        participantTypes: [UserType.COACH, UserType.ADMIN], // This will trigger admin logic
      },
      coachID,
      UserType.COACH
    );

    this.logger.log(`Support conversation created: ${conversation.id} for coach ${coachID}`);
    return conversation;
  }

  // Helper methods
  private async findExistingDirectConversation(
    participantIDs: string[],
    participantTypes: UserType[],
    conversationType?: string
  ) {
    if (participantIDs.length !== 2 && conversationType !== 'coach_to_admin') return null;

    // Special handling for admin conversations
    if (conversationType === 'coach_to_admin') {
      const coachID = participantIDs.find((id, idx) => participantTypes[idx] === UserType.COACH);

      return this.prisma.conversation.findFirst({
        where: {
          type: 'direct',
          participantIDs: { has: coachID },
          participantTypes: { has: UserType.COACH },
          metadata: {
            path: ['pendingAdminAssignment'],
            not: Prisma.JsonNull,
          },
        },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    return this.prisma.conversation.findFirst({
      where: {
        type: 'direct',
        AND: [
          { participantIDs: { hasEvery: participantIDs } },
          { participantTypes: { hasEvery: participantTypes } },
        ],
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  private initializeUnreadCount(participantIDs: string[], participantTypes: UserType[]): Record<string, number> {
    const unreadCount: Record<string, number> = {};
    for (let i = 0; i < participantIDs.length; i++) {
      const key = `${participantTypes[i]}:${participantIDs[i]}`;
      unreadCount[key] = 0;
    }
    return unreadCount;
  }

  private incrementUnreadCount(
    currentCount: Record<string, number>,
    senderID: string,
    senderType: UserType,
    participantIDs: string[],
    participantTypes: UserType[]
  ): Record<string, number> {
    const updatedCount = { ...currentCount };

    for (let i = 0; i < participantIDs.length; i++) {
      const userID = participantIDs[i];
      const userType = participantTypes[i];
      const key = `${userType}:${userID}`;

      if (userID !== senderID || userType !== senderType) {
        updatedCount[key] = (updatedCount[key] || 0) + 1;
      }
    }

    return updatedCount;
  }

  private async resetUnreadCount(conversationID: string, userID: string, userType: UserType) {
    const userKey = `${userType}:${userID}`;

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
    });

    if (conversation) {
      const updatedUnreadCount = {
        ...(conversation.unreadCount as Record<string, number>),
        [userKey]: 0,
      };

      await this.prisma.conversation.update({
        where: { id: conversationID },
        data: { unreadCount: updatedUnreadCount },
      });
    }
  }

  private async updateConversationUnreadCount(conversationID: string, userID: string, userType: UserType) {
    const unreadCount = await this.prisma.directMessage.count({
      where: {
        conversationID,
        NOT: {
          senderID: userID,
          senderType: userType,
        },
        isRead: false,
      },
    });

    const userKey = `${userType}:${userID}`;

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
    });

    if (conversation) {
      const updatedUnreadCount = {
        ...(conversation.unreadCount as Record<string, number>),
        [userKey]: unreadCount,
      };

      await this.prisma.conversation.update({
        where: { id: conversationID },
        data: { unreadCount: updatedUnreadCount },
      });
    }
  }

  private async getUserName(userID: string, userType: UserType): Promise<{ name: string; email: string; }> {
    try {
      let user: any;
      switch (userType) {
        case UserType.COACH:
          user = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, businessName: true, email: true },
          });
          return {
            name: user?.businessName || `${user?.firstName} ${user?.lastName}` || 'Unknown Coach',
            email: user?.email,
          };

        case UserType.CLIENT:
          user = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, email: true },
          });
          return {
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
          };

        case UserType.ADMIN:
          user = await this.prisma.admin.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, email: true },
          });
          return {
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
          };

        default:
          return {
            name: 'Unknown User',
            email: 'Unknown Email',
          };
      }
    } catch (error) {
      this.logger.warn(`Failed to get user name for ${userType} ${userID}`, error);
      return {
        name: 'Unknown User',
        email: 'Unknown Email',
      };
    }
  }

  private async getUserAvatar(userID: string, userType: UserType): Promise<string | undefined> {
    try {
      let user: any;
      switch (userType) {
        case UserType.COACH:
          user = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { avatarUrl: true },
          });
          return user?.avatarUrl;

        case UserType.CLIENT:
          user = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { avatarUrl: true },
          });
          return user?.avatarUrl;

        case UserType.ADMIN:
          return undefined;

        default:
          return undefined;
      }
    } catch (error) {
      this.logger.warn(`Failed to get user avatar for ${userType} ${userID}`, error);
      return undefined;
    }
  }
}
