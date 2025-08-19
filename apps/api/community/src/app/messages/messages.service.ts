import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {
  UserType,
  MessageType,
  CommunityEvent,
  COMMUNITY_ROUTING_KEYS,
  CreateMessageRequest,
  MessageFilters,
  CreateConversationRequest
} from '@nlc-ai/api-types';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly configService: ConfigService
  ) {}

  async createConversation(createRequest: CreateConversationRequest, creatorID: string, creatorType: UserType) {
    // Validate participants
    if (createRequest.participantIDs.length < 2) {
      throw new ForbiddenException('Conversation must have at least 2 participants');
    }

    // Ensure creator is in participants
    if (!createRequest.participantIDs.includes(creatorID)) {
      createRequest.participantIDs.push(creatorID);
      createRequest.participantTypes.push(creatorType);
    }

    // For direct messages, check if conversation already exists
    if (createRequest.type === 'direct' && createRequest.participantIDs.length === 2) {
      const existingConversation = await this.prisma.conversation.findFirst({
        where: {
          type: 'direct',
          AND: [
            { participantIDs: { hasEvery: createRequest.participantIDs } },
            // @ts-ignore
            { participantIDs: { array_length: 2 } },
          ],
        },
      });

      if (existingConversation) {
        return existingConversation;
      }
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        type: createRequest.type,
        name: createRequest.name,
        participantIDs: createRequest.participantIDs,
        participantTypes: createRequest.participantTypes,
        unreadCount: createRequest.participantIDs.reduce((acc, id) => {
          acc[id] = 0;
          return acc;
        }, {} as Record<string, number>),
      },
    });

    this.logger.log(`Conversation created: ${conversation.id} by ${creatorType} ${creatorID}`);

    return conversation;
  }

  async sendMessage(conversationID: string, createRequest: CreateMessageRequest, senderID: string, senderType: UserType) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if sender is a participant
    const senderIndex = conversation.participantIDs.indexOf(senderID);
    if (senderIndex === -1 || conversation.participantTypes[senderIndex] !== senderType) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const maxLength = this.configService.get<number>('community.features.maxMessageLength', 2000);
    if (createRequest.content.length > maxLength) {
      throw new ForbiddenException(`Message content exceeds maximum length of ${maxLength} characters`);
    }

    const message = await this.prisma.directMessage.create({
      data: {
        conversationID,
        senderID,
        senderType,
        type: createRequest.type || MessageType.TEXT,
        content: createRequest.content,
        mediaUrls: createRequest.mediaUrls || [],
        fileUrl: createRequest.fileUrl,
        fileName: createRequest.fileName,
        fileSize: createRequest.fileSize,
        replyToMessageID: createRequest.replyToMessageID,
      },
    });

    // Update conversation with last message info
    const unreadCount = { ...JSON.parse(conversation.unreadCount as string) };
    conversation.participantIDs.forEach(participantID => {
      if (participantID !== senderID) {
        unreadCount[participantID] = (unreadCount[participantID] || 0) + 1;
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversationID },
      data: {
        lastMessageID: message.id,
        lastMessageAt: message.createdAt,
        unreadCount,
      },
    });

    // Get sender name
    const senderName = await this.getUserName(senderID, senderType);

    // Publish events for each recipient
    for (let i = 0; i < conversation.participantIDs.length; i++) {
      const participantID = conversation.participantIDs[i];
      const participantType = conversation.participantTypes[i];

      if (participantID !== senderID) {
        await this.outboxService.saveAndPublishEvent<CommunityEvent>({
          eventType: 'community.message.sent',
          schemaVersion: 1,
          payload: {
            messageID: message.id,
            conversationID,
            senderID,
            senderType,
            senderName,
            recipientID: participantID,
            recipientType: participantType as UserType,
            type: message.type as MessageType,
            content: message.content,
            sentAt: message.createdAt.toISOString(),
          },
        }, COMMUNITY_ROUTING_KEYS.MESSAGE_SENT);
      }
    }

    this.logger.log(`Message sent: ${message.id} in conversation ${conversationID} by ${senderType} ${senderID}`);

    return message;
  }

  async getConversations(userID: string, userType: UserType, page = 1, limit = 20) {
    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          AND: [
            { participantIDs: { has: userID } },
            { participantTypes: { has: userType } },
          ],
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Last message only
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.conversation.count({
        where: {
          AND: [
            { participantIDs: { has: userID } },
            { participantTypes: { has: userType } },
          ],
        },
      }),
    ]);

    return {
      conversations: conversations.map(conv => ({
        ...conv,
        unreadCount: JSON.parse(conv.unreadCount as string)?.[userID] || 0,
        lastMessage: conv.messages[0] || null,
        messages: undefined, // Remove messages array from response
      })),
      total,
      page,
      limit,
    };
  }

  async getMessages(conversationID: string, userID: string, userType: UserType, filters: MessageFilters) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    const userIndex = conversation.participantIDs.indexOf(userID);
    if (userIndex === -1 || conversation.participantTypes[userIndex] !== userType) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const where: any = { conversationID };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      where.content = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.before) {
      where.createdAt = { lt: new Date(filters.before) };
    }

    if (filters.after) {
      where.createdAt = { gt: new Date(filters.after) };
    }

    const [messages, total] = await Promise.all([
      this.prisma.directMessage.findMany({
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
        skip: ((filters.page || 1) - 1) * (filters.limit || 50),
        take: filters.limit || 50,
      }),
      this.prisma.directMessage.count({ where }),
    ]);

    return {
      messages: messages.reverse(), // Show oldest first
      total,
      page: filters.page || 1,
      limit: filters.limit || 50,
    };
  }

  async markAsRead(conversationID: string, userID: string, userType: UserType) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationID },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    const userIndex = conversation.participantIDs.indexOf(userID);
    if (userIndex === -1 || conversation.participantTypes[userIndex] !== userType) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Mark messages as read
    await this.prisma.directMessage.updateMany({
      where: {
        conversationID,
        senderID: { not: userID },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Reset unread count for this user
    const unreadCount = { ...JSON.parse(conversation.unreadCount as string) };
    unreadCount[userID] = 0;

    await this.prisma.conversation.update({
      where: { id: conversationID },
      data: { unreadCount },
    });

    this.logger.log(`Messages marked as read in conversation ${conversationID} by ${userType} ${userID}`);

    return { message: 'Messages marked as read' };
  }

  async deleteMessage(messageID: string, userID: string, userType: UserType) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageID },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can delete their own messages
    if (message.senderID !== userID || message.senderType !== userType) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.directMessage.delete({
      where: { id: messageID },
    });

    this.logger.log(`Message ${messageID} deleted by ${userType} ${userID}`);

    return { message: 'Message deleted successfully' };
  }

  async editMessage(messageID: string, content: string, userID: string, userType: UserType) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageID },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can edit their own messages
    if (message.senderID !== userID || message.senderType !== userType) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Cannot edit system messages
    if (message.type === MessageType.SYSTEM) {
      throw new ForbiddenException('System messages cannot be edited');
    }

    const maxLength = this.configService.get<number>('community.features.maxMessageLength', 2000);
    if (content.length > maxLength) {
      throw new ForbiddenException(`Message content exceeds maximum length of ${maxLength} characters`);
    }

    const updatedMessage = await this.prisma.directMessage.update({
      where: { id: messageID },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    this.logger.log(`Message ${messageID} edited by ${userType} ${userID}`);

    return updatedMessage;
  }

  async getUnreadCount(userID: string, userType: UserType) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        AND: [
          { participantIDs: { has: userID } },
          { participantTypes: { has: userType } },
        ],
      },
      select: { unreadCount: true },
    });

    const totalUnread = conversations.reduce((total, conv) => {
      return total + (JSON.parse(conv.unreadCount as string)[userID] || 0);
    }, 0);

    return { unreadCount: totalUnread };
  }

  private async getUserName(userID: string, userType: UserType): Promise<string> {
    try {
      switch (userType) {
        case UserType.coach:
          const coach = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, businessName: true },
          });
          return coach?.businessName || `${coach?.firstName} ${coach?.lastName}` || 'Unknown Coach';

        case UserType.client:
          const client = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true },
          });
          return `${client?.firstName} ${client?.lastName}` || 'Unknown Client';

        case UserType.admin:
          const admin = await this.prisma.admin.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true },
          });
          return `${admin?.firstName} ${admin?.lastName}` || 'Admin';

        default:
          return 'Unknown User';
      }
    } catch (error) {
      this.logger.warn(`Failed to get user name for ${userType} ${userID}`, error);
      return 'Unknown User';
    }
  }
}
