import {BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException,} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {MessageType, MESSAGING_ROUTING_KEYS, MessagingEvent, UserType} from '@nlc-ai/api-types';
import {OutboxService} from '@nlc-ai/api-messaging';
import {
  ConversationFiltersDto,
  CreateConversationDto,
  CreateMessageDto,
  MessageFiltersDto,
  UpdateMessageDto,
} from './dto';
import {MessagesGateway} from '../websocket/messages.gateway';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
    private readonly outboxService: OutboxService,
  ) {}

  async createConversation(
    createDto: CreateConversationDto,
    userID: string,
    userType: UserType
  ) {
    try {
      if (userType === UserType.admin) {
        if (!createDto.participantIDs.includes(UserType.admin)) {
          createDto.participantIDs.push(UserType.admin);
          createDto.participantTypes.push(UserType.admin);
        }
      } else {
        if (!createDto.participantIDs.includes(userID)) {
          createDto.participantIDs.push(userID);
          createDto.participantTypes.push(userType);
        }
      }

      if (createDto.type === 'direct' && createDto.participantIDs.length !== 2) {
        throw new BadRequestException('Direct conversations must have exactly 2 participants');
      }

      if (createDto.type === 'direct') {
        const existingConversation = await this.findExistingDirectConversation(
          createDto.participantIDs,
          createDto.participantTypes
        );
        if (existingConversation) {
          return existingConversation;
        }
      }

      const conversation = await this.prisma.conversation.create({
        data: {
          type: createDto.type,
          name: createDto.name,
          participantIDs: createDto.participantIDs,
          participantTypes: createDto.participantTypes,
          unreadCount: this.initializeUnreadCount(createDto.participantIDs, createDto.participantTypes),
        },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      const creatorName = await this.getUserName(userID, userType);

      await this.outboxService.saveAndPublishEvent<MessagingEvent>({
        eventType: 'messaging.conversation.created',
        schemaVersion: 1,
        payload: {
          conversationID: conversation.id,
          type: conversation.type as 'direct' | 'group',
          name: conversation.name,
          participantIDs: conversation.participantIDs,
          participantTypes: conversation.participantTypes as UserType[],
          creatorID: userID,
          creatorType: userType,
          creatorName,
          createdAt: conversation.createdAt.toISOString(),
        },
      }, MESSAGING_ROUTING_KEYS.CONVERSATION_CREATED);

      this.logger.log(`Conversation created: ${conversation.id}`);
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
    console.log("User ID: ", userID);
    let where: any;
    if (userType === UserType.admin) {
      where = {
        participantIDs: { has: UserType.admin },
      };
    } else {
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

    if (!this.isParticipant(conversation, userID, userType)) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    await this.resetUnreadCount(conversationID, userID, userType);

    return conversation;
  }

  // Update sendMessage method to check presence and emit email event

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

    if (!this.isParticipant(conversation, senderID, senderType)) {
      throw new ForbiddenException('Not authorized to send messages in this conversation');
    }

    const senderName = await this.getUserName(senderID, senderType);

    const message = await this.prisma.directMessage.create({
      data: {
        conversationID,
        senderID,
        senderType,
        senderName,
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
      conversation.participantIDs,
      conversation.participantTypes as UserType[]
    );

    await this.prisma.conversation.update({
      where: { id: conversationID },
      data: {
        lastMessageID: message.id,
        lastMessageAt: new Date(),
        unreadCount: updatedUnreadCount,
      },
    });

    await this.messagesGateway.broadcastNewMessage(conversationID, message, conversation);

    for (let i = 0; i < conversation.participantIDs.length; i++) {
      const participantID = conversation.participantIDs[i];
      const participantType = conversation.participantTypes[i] as UserType;

      if (senderType === UserType.admin
        && participantID === UserType.admin) {
        continue;
      }

      if (
        participantID === senderID
        && participantType === senderType) {
        continue;
      }

      const isRecipientViewing = this.messagesGateway.isUserViewingConversation(conversationID, participantID, participantType);

      const isRecipientOnline = await this.messagesGateway.isUserOnline(participantID, participantType);

      if (!isRecipientViewing) {
        const recipientName = participantType === UserType.admin
          ? 'Admin Support'
          : await this.getUserName(participantID, participantType);

        await this.outboxService.saveAndPublishEvent<MessagingEvent>({
          eventType: 'messaging.message.created',
          schemaVersion: 1,
          payload: {
            messageID: message.id,
            conversationID,
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

        if (!isRecipientOnline) {
          await this.outboxService.saveAndPublishEvent({
            eventType: 'messaging.notification.email',
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
              messageContent: message.content,
              messageType: message.type,
              timestamp: new Date().toISOString(),
            },
          } as any, 'messaging.notification.email');

          this.logger.log(`📧 Email notification queued for offline user: ${participantType}:${participantID}`);
        }
      }
    }

    this.logger.log(`Message sent: ${message.id} in conversation ${conversationID}`);
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

    if (!this.isParticipant(conversation, userID, userType)) {
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

    // Broadcast the message update via WebSocket
    await this.messagesGateway.broadcastMessageUpdate(message.conversationID, updatedMessage);

    // Emit message updated event
    await this.outboxService.saveAndPublishEvent<MessagingEvent>({
      eventType: 'messaging.message.updated',
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

    // Broadcast the message deletion via WebSocket
    await this.messagesGateway.broadcastMessageDelete(message.conversationID, messageID);

    // Emit message deleted event
    await this.outboxService.saveAndPublishEvent<MessagingEvent>({
      eventType: 'messaging.message.deleted',
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
    // Update messages as read
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

    // Get conversation ID for broadcasting
    const firstMessage = await this.prisma.directMessage.findFirst({
      where: { id: { in: messageIDs } },
      select: { conversationID: true },
    });

    if (firstMessage) {
      // Broadcast read status via WebSocket
      await this.messagesGateway.broadcastReadStatus(
        firstMessage.conversationID,
        messageIDs,
        userID,
        userType
      );

      // Update conversation unread count
      await this.updateConversationUnreadCount(firstMessage.conversationID, userID, userType);

      // Emit message read event
      await this.outboxService.saveAndPublishEvent<MessagingEvent>({
        eventType: 'messaging.message.read',
        schemaVersion: 1,
        payload: {
          messageIDs,
          conversationID: firstMessage.conversationID,
          readerID: userID,
          readerType: userType,
          readAt: new Date().toISOString(),
        },
      }, MESSAGING_ROUTING_KEYS.MESSAGE_READ);
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

    if (!this.isParticipant(conversation, userID, userType)) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const userKey = `${userType}:${userID}`;
    const unreadCount = (conversation.unreadCount as Record<string, number>)[userKey] || 0;

    return { unreadCount };
  }

  async createSupportConversation(coachID: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!admin) {
      throw new NotFoundException('No admin available for support');
    }

    const existingConversation = await this.findExistingDirectConversation(
      [coachID, admin.id],
      [UserType.coach, UserType.admin]
    );

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = await this.createConversation(
      {
        type: 'direct',
        name: 'Support Chat',
        participantIDs: [coachID, admin.id],
        participantTypes: [UserType.coach, UserType.admin],
      },
      coachID,
      UserType.coach
    );

    this.logger.log(`Support conversation created: ${conversation.id} for coach ${coachID}`);
    return conversation;
  }

  // Helper methods
  private async findExistingDirectConversation(participantIDs: string[], participantTypes: UserType[]) {
    if (participantIDs.length !== 2) return null;

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

  private isParticipant(conversation: any, userID: string, userType: UserType): boolean {
    userID = userType === UserType.admin ? UserType.admin : userID;
    const userIndex = conversation.participantIDs.indexOf(userID);
    return userIndex !== -1 && conversation.participantTypes[userIndex] === userType;
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

  private async getUserName(userID: string, userType: UserType): Promise<string> {
    try {
      let user: any;
      switch (userType) {
        case UserType.coach:
          user = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, businessName: true },
          });
          return user?.businessName || `${user?.firstName} ${user?.lastName}` || 'Unknown Coach';

        case UserType.client:
          user = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true },
          });
          return `${user?.firstName} ${user?.lastName}`;

        case UserType.admin:
          user = await this.prisma.admin.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true },
          });
          return `${user?.firstName} ${user?.lastName}`;

        default:
          return 'Unknown User';
      }
    } catch (error) {
      this.logger.warn(`Failed to get user name for ${userType} ${userID}`, error);
      return 'Unknown User';
    }
  }
}
