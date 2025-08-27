import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
// import { OutboxService } from '@nlc-ai/api-messaging';
import {MessageType, UserType} from '@nlc-ai/api-types';
import {
  CreateConversationDto,
  CreateMessageDto,
  UpdateMessageDto,
  MessageFiltersDto,
  ConversationFiltersDto,
} from './dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    // private readonly outboxService: OutboxService,
  ) {}

  async createConversation(
    createDto: CreateConversationDto,
    userID: string,
    userType: UserType
  ) {
    try {
      // Ensure creator is in participants
      if (!createDto.participantIDs.includes(userID)) {
        createDto.participantIDs.push(userID);
        createDto.participantTypes.push(userType);
      }

      // For direct conversations, ensure only 2 participants
      if (createDto.type === 'direct' && createDto.participantIDs.length !== 2) {
        throw new BadRequestException('Direct conversations must have exactly 2 participants');
      }

      // Check if direct conversation already exists
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
    const userKey = `${userType}:${userID}`;

    const where: any = {
      participantIDs: { has: userID },
      participantTypes: { has: userType },
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.unreadOnly) {
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
          take: 50, // Get recent messages
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is participant
    if (!this.isParticipant(conversation, userID, userType)) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    return conversation;
  }

  async sendMessage(
    conversationID: string,
    createDto: CreateMessageDto,
    senderID: string,
    senderType: UserType,
    senderName: string,
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

    // Update conversation
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

    // Publish message event
    await this.publishMessageEvent(message, conversation);

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

    // Update conversation unread counts
    const messages = await this.prisma.directMessage.findMany({
      where: { id: { in: messageIDs } },
      select: { conversationID: true },
    });

    const conversationIDs = [...new Set(messages.map(m => m.conversationID))];

    for (const conversationID of conversationIDs) {
      await this.updateConversationUnreadCount(conversationID, userID, userType);
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
    // Find an admin to create conversation with
    const admin = await this.prisma.admin.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!admin) {
      throw new NotFoundException('No admin available for support');
    }

    // Check if conversation already exists
    const existingConversation = await this.findExistingDirectConversation(
      [coachID, admin.id],
      [UserType.coach, UserType.admin]
    );

    if (existingConversation) {
      return existingConversation;
    }

    // Create new support conversation
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

      // Don't increment for sender
      if (userID !== senderID || userType !== senderType) {
        updatedCount[key] = (updatedCount[key] || 0) + 1;
      }
    }

    return updatedCount;
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

  private async publishMessageEvent(message: any, conversation: any) {
    // Implementation would depend on your event system
    // This is a placeholder for the event publishing logic
  }
}
