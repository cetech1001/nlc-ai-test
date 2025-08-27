import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@nlc-ai/api-database';
import { UserType } from '@nlc-ai/api-types';

interface AuthenticatedSocket extends Socket {
  userID: string;
  userType: UserType;
}

interface JoinRoomPayload {
  conversationID: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:4300'],
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MessagesGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userID

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const socket = client as AuthenticatedSocket;

      socket.userID = payload.sub;
      socket.userType = payload.type;

      this.connectedUsers.set(client.id, payload.sub);

      // Join user to their personal room for notifications
      await client.join(`user:${payload.type}:${payload.sub}`);

      this.logger.log(`User ${payload.sub} (${payload.type}) connected`);
    } catch (error) {
      this.logger.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userID = this.connectedUsers.get(client.id);
    if (userID) {
      this.connectedUsers.delete(client.id);
      this.logger.log(`User ${userID} disconnected`);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    try {
      const { conversationID } = payload;

      // Verify user is participant in conversation
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationID },
      });

      if (!conversation) {
        client.emit('error', { message: 'Conversation not found' });
        return;
      }

      const userIndex = conversation.participantIDs.indexOf(client.userID);
      const isParticipant = userIndex !== -1 &&
        conversation.participantTypes[userIndex] === client.userType;

      if (!isParticipant) {
        client.emit('error', { message: 'Not authorized to join this conversation' });
        return;
      }

      await client.join(`conversation:${conversationID}`);
      client.emit('joined_conversation', { conversationID });

      this.logger.log(`User ${client.userID} joined conversation ${conversationID}`);
    } catch (error) {
      this.logger.error('Error joining conversation:', error);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { conversationID } = payload;
    await client.leave(`conversation:${conversationID}`);
    this.logger.log(`User ${client.userID} left conversation ${conversationID}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationID: string; isTyping: boolean },
  ) {
    const { conversationID, isTyping } = payload;

    // Broadcast typing status to other participants in the conversation
    client.to(`conversation:${conversationID}`).emit('user_typing', {
      userID: client.userID,
      userType: client.userType,
      isTyping,
    });
  }

  // Called by MessagesService when a new message is created
  async broadcastNewMessage(conversationID: string, message: any, conversation: any) {
    this.server.to(`conversation:${conversationID}`).emit('new_message', {
      conversationID,
      message,
    });

    // Send push notifications to offline users
    await this.notifyOfflineUsers(conversation, message);
  }

  // Called by MessagesService when a message is updated
  async broadcastMessageUpdate(conversationID: string, message: any) {
    this.server.to(`conversation:${conversationID}`).emit('message_updated', {
      conversationID,
      message,
    });
  }

  // Called by MessagesService when a message is deleted
  async broadcastMessageDelete(conversationID: string, messageID: string) {
    this.server.to(`conversation:${conversationID}`).emit('message_deleted', {
      conversationID,
      messageID,
    });
  }

  // Called by MessagesService when messages are marked as read
  async broadcastReadStatus(conversationID: string, messageIDs: string[], readerID: string, readerType: UserType) {
    this.server.to(`conversation:${conversationID}`).emit('messages_read', {
      conversationID,
      messageIDs,
      readerID,
      readerType,
    });
  }

  private async notifyOfflineUsers(conversation: any, message: any) {
    // Get all participants except the sender
    const recipients = conversation.participantIDs
      .filter((id: string, index: number) => {
        return !(id === message.senderID && conversation.participantTypes[index] === message.senderType);
      })
      .map((id: string) => ({
        id,
        type: conversation.participantTypes[
          conversation.participantIDs.indexOf(id)
        ],
      }));

    // Check which users are not connected
    const connectedUserIDs = Array.from(this.connectedUsers.values());
    const offlineRecipients = recipients.filter(
      (recipient: { id: string, type: UserType[] }) => !connectedUserIDs.includes(recipient.id)
    );

    // Here you would integrate with your push notification service
    for (const recipient of offlineRecipients) {
      this.logger.log(`Would send push notification to offline user: ${recipient.id}`);
      // TODO: Implement push notification logic
    }
  }
}
