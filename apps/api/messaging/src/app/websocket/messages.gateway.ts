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
    origin: process.env.CORS_ORIGINS,
    credentials: process.env.CORS_CREDENTIALS,
  },
  path: '/socket.io',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MessagesGateway.name);
  private connectedUsers = new Map<string, { userID: string; userType: UserType }>(); // socketID -> user info

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`🔌 New connection attempt: ${client.id}`);

      const token = client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '') ||
        client.handshake.query.token;

      if (!token) {
        this.logger.error('❌ No token provided');
        client.emit('connect_error', { message: 'No authentication token provided' });
        client.disconnect();
        return;
      }

      let payload;
      try {
        payload = this.jwtService.verify(token);
      } catch (error: any) {
        this.logger.error('❌ Token verification failed:', error.message);
        client.emit('connect_error', { message: 'Invalid authentication token' });
        client.disconnect();
        return;
      }

      const socket = client as AuthenticatedSocket;
      socket.userID = payload.sub;
      socket.userType = payload.type;

      this.connectedUsers.set(client.id, {
        userID: payload.sub,
        userType: payload.type,
      });

      // Join user to their personal room for notifications
      await client.join(`user:${payload.type}:${payload.sub}`);

      this.logger.log(`✅ User ${payload.sub} (${payload.type}) connected with socket ${client.id}`);

      // Send connection confirmation
      client.emit('connected', {
        userID: payload.sub,
        userType: payload.type,
        socketID: client.id
      });

    } catch (error) {
      this.logger.error('💥 Error handling connection:', error);
      client.emit('connect_error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo) {
      this.connectedUsers.delete(client.id);
      this.logger.log(`🔌 User ${userInfo.userID} (${userInfo.userType}) disconnected`);
    } else {
      this.logger.log(`🔌 Unknown client ${client.id} disconnected`);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    try {
      const { conversationID } = payload;
      this.logger.log(`🚪 User ${client.userID} attempting to join conversation ${conversationID}`);

      // Verify user is participant in conversation
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationID },
      });

      if (!conversation) {
        this.logger.error(`❌ Conversation ${conversationID} not found`);
        client.emit('error', { message: 'Conversation not found' });
        return;
      }

      const userIndex = conversation.participantIDs.indexOf(client.userID);
      const isParticipant = userIndex !== -1 &&
        conversation.participantTypes[userIndex] === client.userType;

      if (!isParticipant) {
        this.logger.error(`❌ User ${client.userID} not authorized for conversation ${conversationID}`);
        client.emit('error', { message: 'Not authorized to join this conversation' });
        return;
      }

      await client.join(`conversation:${conversationID}`);
      client.emit('joined_conversation', { conversationID });

      this.logger.log(`✅ User ${client.userID} joined conversation ${conversationID}`);
    } catch (error) {
      this.logger.error('💥 Error joining conversation:', error);
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
    client.emit('left_conversation', { conversationID });
    this.logger.log(`🚪 User ${client.userID} left conversation ${conversationID}`);
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
      conversationID,
      isTyping,
    });

    this.logger.debug(`👀 User ${client.userID} typing status: ${isTyping} in conversation ${conversationID}`);
  }

  // Called by MessagesService when a new message is created
  async broadcastNewMessage(conversationID: string, message: any, conversation: any) {
    this.logger.log(`📨 Broadcasting new message in conversation ${conversationID}`);
    this.server.to(`conversation:${conversationID}`).emit('new_message', {
      conversationID,
      message,
    });

    // Send push notifications to offline users
    await this.notifyOfflineUsers(conversation, message);
  }

  // Called by MessagesService when a message is updated
  async broadcastMessageUpdate(conversationID: string, message: any) {
    this.logger.log(`✏️ Broadcasting message update in conversation ${conversationID}`);
    this.server.to(`conversation:${conversationID}`).emit('message_updated', {
      conversationID,
      message,
    });
  }

  // Called by MessagesService when a message is deleted
  async broadcastMessageDelete(conversationID: string, messageID: string) {
    this.logger.log(`🗑️ Broadcasting message delete in conversation ${conversationID}`);
    this.server.to(`conversation:${conversationID}`).emit('message_deleted', {
      conversationID,
      messageID,
    });
  }

  // Called by MessagesService when messages are marked as read
  async broadcastReadStatus(conversationID: string, messageIDs: string[], readerID: string, readerType: UserType) {
    this.logger.log(`👁️ Broadcasting read status in conversation ${conversationID}`);
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
      .map((id: string, index: number) => ({
        id,
        type: conversation.participantTypes[index],
      }));

    // Check which users are not connected
    const connectedUserIDs = Array.from(this.connectedUsers.values()).map(user => user.userID);
    const offlineRecipients = recipients.filter(
      (recipient: { id: string; type: UserType }) => !connectedUserIDs.includes(recipient.id)
    );

    // Here you would integrate with your push notification service
    for (const recipient of offlineRecipients) {
      this.logger.log(`📱 Would send push notification to offline user: ${recipient.id} (${recipient.type})`);
      // TODO: Implement push notification logic
    }
  }

  // Get connection stats
  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      connectedUsers: Array.from(this.connectedUsers.values()),
    };
  }
}
