import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {Logger} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '@nlc-ai/api-database';
import {UserType} from '@nlc-ai/api-types';
import {PresenceService} from "../presence/presence.service";

interface AuthenticatedSocket extends Socket {
  userID: string;
  userType: UserType;
  userName: string;
}

interface JoinRoomPayload {
  conversationID: string;
}

interface TypingPayload {
  conversationID: string;
  isTyping: boolean;
}

interface ConnectionInfo {
  userID: string;
  userType: UserType;
  userName: string;
  joinedRooms: Set<string>;
  lastActivity: number;
  heartbeatInterval?: NodeJS.Timeout;
}

const TYPING_TIMEOUT = 3000;
const CLEANUP_INTERVAL = 30000;
const INACTIVITY_TIMEOUT = 300000;
const HEARTBEAT_INTERVAL = 20000;

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

  private conversationViewers = new Map<string, Set<string>>();
  private connections = new Map<string, ConnectionInfo>();
  private roomMembers = new Map<string, Set<string>>();
  private typingStates = new Map<string, Map<string, NodeJS.Timeout>>();

  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly presenceService: PresenceService,
  ) {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, CLEANUP_INTERVAL);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanup();
  }

  public isUserViewingConversation(conversationID: string, userID: string, userType: UserType): boolean {
    const viewers = this.conversationViewers.get(conversationID);
    if (!viewers) return false;

    const userKey = `${userType}:${userID}`;
    return viewers.has(userKey);
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`🔌 New connection attempt: ${client.id}`);

      const token = this.extractToken(client);
      if (!token) {
        this.logger.error('❌ No token provided');
        client.emit('connect_error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      let payload;
      try {
        payload = this.jwtService.verify(token);
      } catch (error: any) {
        this.logger.error('❌ Token verification failed:', error.message);
        client.emit('connect_error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      const socket = client as AuthenticatedSocket;
      socket.userID = payload.sub;
      socket.userType = payload.type;
      socket.userName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();

      // Set user as online in Redis
      await this.presenceService.setOnline(payload.sub, payload.type, client.id);

      // Start heartbeat interval to keep presence alive
      const heartbeatInterval = setInterval(async () => {
        try {
          await this.presenceService.refreshPresence(payload.sub, payload.type, client.id);
        } catch (error) {
          this.logger.error(`Failed to refresh presence for ${payload.sub}:`, error);
        }
      }, HEARTBEAT_INTERVAL);

      this.connections.set(client.id, {
        userID: payload.sub,
        userType: payload.type,
        userName: socket.userName,
        joinedRooms: new Set(),
        lastActivity: Date.now(),
        heartbeatInterval,
      });

      await client.join(`user:${payload.type}:${payload.sub}`);

      this.logger.log(`✅ User ${payload.sub} (${payload.type}) connected`);
      client.emit('connected', {
        userID: payload.sub,
        userType: payload.type,
        socketID: client.id,
      });

    } catch (error) {
      this.logger.error('💥 Connection error:', error);
      client.emit('connect_error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const connectionInfo = this.connections.get(client.id);

    if (connectionInfo) {
      const userKey = `${connectionInfo.userType}:${connectionInfo.userID}`;

      // Clear heartbeat interval
      if (connectionInfo.heartbeatInterval) {
        clearInterval(connectionInfo.heartbeatInterval);
      }

      // Set user as offline in Redis
      this.presenceService.setOffline(connectionInfo.userID, connectionInfo.userType);

      connectionInfo.joinedRooms.forEach(roomID => {
        const roomMembers = this.roomMembers.get(roomID);
        if (roomMembers) {
          roomMembers.delete(client.id);
          if (roomMembers.size === 0) {
            this.roomMembers.delete(roomID);
          }
        }

        // Clean up conversation viewers
        if (roomID.startsWith('conversation:')) {
          const conversationID = roomID.replace('conversation:', '');
          const viewers = this.conversationViewers.get(conversationID);
          if (viewers) {
            viewers.delete(userKey);
            if (viewers.size === 0) {
              this.conversationViewers.delete(conversationID);
            }
          }
        }
      });

      this.cleanupTypingForUser(connectionInfo.userID, connectionInfo.userType);
      this.connections.delete(client.id);
      this.logger.log(`🔌 User ${connectionInfo.userID} (${connectionInfo.userType}) disconnected`);
    } else {
      this.logger.log(`🔌 Unknown client ${client.id} disconnected`);
    }
  }

  public async isUserOnline(userID: string, userType: UserType): Promise<boolean> {
    return await this.presenceService.isOnline(userID, userType);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    try {
      this.updateActivity(client.id);

      const { conversationID } = payload;
      this.logger.log(`🚪 User ${client.userID} joining conversation ${conversationID}`);

      const hasAccess = await this.verifyConversationAccess(conversationID, client.userID, client.userType);
      if (!hasAccess) {
        this.logger.error(`❌ User ${client.userID} unauthorized for conversation ${conversationID}`);
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      const roomID = `conversation:${conversationID}`;
      const userKey = `${client.userType}:${client.userID}`;

      await client.join(roomID);

      const connectionInfo = this.connections.get(client.id);
      if (connectionInfo) {
        connectionInfo.joinedRooms.add(roomID);
      }

      if (!this.roomMembers.has(roomID)) {
        this.roomMembers.set(roomID, new Set());
      }
      this.roomMembers.get(roomID)!.add(client.id);

      // Track conversation viewers
      if (!this.conversationViewers.has(conversationID)) {
        this.conversationViewers.set(conversationID, new Set());
      }
      this.conversationViewers.get(conversationID)!.add(userKey);

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
    this.updateActivity(client.id);

    const { conversationID } = payload;
    const roomID = `conversation:${conversationID}`;
    const userKey = `${client.userType}:${client.userID}`;

    await client.leave(roomID);

    const connectionInfo = this.connections.get(client.id);
    if (connectionInfo) {
      connectionInfo.joinedRooms.delete(roomID);
    }

    const roomMembers = this.roomMembers.get(roomID);
    if (roomMembers) {
      roomMembers.delete(client.id);
      if (roomMembers.size === 0) {
        this.roomMembers.delete(roomID);
      }
    }

    // Remove from conversation viewers
    const viewers = this.conversationViewers.get(conversationID);
    if (viewers) {
      viewers.delete(userKey);
      if (viewers.size === 0) {
        this.conversationViewers.delete(conversationID);
      }
    }

    client.emit('left_conversation', { conversationID });
    this.logger.log(`🚪 User ${client.userID} left conversation ${conversationID}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ) {
    this.updateActivity(client.id);

    const { conversationID, isTyping } = payload;
    const userKey = `${client.userType}:${client.userID}`;

    if (!this.typingStates.has(conversationID)) {
      this.typingStates.set(conversationID, new Map());
    }
    const conversationTyping = this.typingStates.get(conversationID)!;

    const existingTimeout = conversationTyping.get(userKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      conversationTyping.delete(userKey);
    }

    if (isTyping) {
      const timeout = setTimeout(() => {
        this.broadcastTypingStatus(conversationID, client, false);
        conversationTyping.delete(userKey);
      }, TYPING_TIMEOUT);

      conversationTyping.set(userKey, timeout);
    }

    this.broadcastTypingStatus(conversationID, client, isTyping);
  }

  async broadcastNewMessage(conversationID: string, message: any, conversation?: any) {
    this.logger.log(`📨 Broadcasting new message in conversation ${conversationID}`);

    const roomID = `conversation:${conversationID}`;
    this.server.to(roomID).emit('new_message', {
      conversationID,
      message,
    });

    this.clearTypingForUser(conversationID, message.senderID, message.senderType);
  }

  async broadcastMessageUpdate(conversationID: string, message: any) {
    this.logger.log(`✏️ Broadcasting message update in conversation ${conversationID}`);

    const roomID = `conversation:${conversationID}`;
    this.server.to(roomID).emit('message_updated', {
      conversationID,
      message,
    });
  }

  async broadcastMessageDelete(conversationID: string, messageID: string) {
    this.logger.log(`🗑️ Broadcasting message delete in conversation ${conversationID}`);

    const roomID = `conversation:${conversationID}`;
    this.server.to(roomID).emit('message_deleted', {
      conversationID,
      messageID,
    });
  }

  async broadcastReadStatus(conversationID: string, messageIDs: string[], readerID: string, readerType: UserType) {
    this.logger.log(`👁️ Broadcasting read status in conversation ${conversationID}`);

    const roomID = `conversation:${conversationID}`;
    this.server.to(roomID).emit('messages_read', {
      conversationID,
      messageIDs,
      readerID,
      readerType,
    });
  }

  private extractToken(client: Socket): string | null {
    return client.handshake.auth.token ||
      client.handshake.headers.authorization?.replace('Bearer ', '') ||
      client.handshake.query.token as string ||
      null;
  }

  private updateActivity(socketID: string) {
    const connectionInfo = this.connections.get(socketID);
    if (connectionInfo) {
      connectionInfo.lastActivity = Date.now();
    }
  }

  private async verifyConversationAccess(conversationID: string, userID: string, userType: UserType): Promise<boolean> {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationID },
        select: { participantIDs: true, participantTypes: true },
      });

      if (!conversation) return false;

      const userIndex = conversation.participantIDs.indexOf(userType === UserType.admin ? UserType.admin : userID);
      return userIndex !== -1 && conversation.participantTypes[userIndex] === userType;
    } catch (error) {
      this.logger.error('Error verifying conversation access:', error);
      return false;
    }
  }

  private broadcastTypingStatus(conversationID: string, sender: AuthenticatedSocket, isTyping: boolean) {
    const roomID = `conversation:${conversationID}`;

    sender.to(roomID).emit('user_typing', {
      userID: sender.userType === UserType.admin ? UserType.admin : sender.userID,
      userType: sender.userType,
      conversationID,
      isTyping,
    });

    this.logger.debug(`👀 User ${sender.userType === UserType.admin ? UserType.admin : sender.userID} typing status: ${isTyping} in conversation ${conversationID}`);
  }

  private clearTypingForUser(conversationID: string, userID: string, userType: UserType) {
    const userKey = `${userType}:${userID}`;
    const conversationTyping = this.typingStates.get(conversationID);

    if (conversationTyping) {
      const timeout = conversationTyping.get(userKey);
      if (timeout) {
        clearTimeout(timeout);
        conversationTyping.delete(userKey);
      }

      if (conversationTyping.size === 0) {
        this.typingStates.delete(conversationID);
      }
    }
  }

  private cleanupTypingForUser(userID: string, userType: UserType) {
    const userKey = `${userType}:${userID}`;

    this.typingStates.forEach((conversationTyping, conversationID) => {
      const timeout = conversationTyping.get(userKey);
      if (timeout) {
        clearTimeout(timeout);
        conversationTyping.delete(userKey);
      }

      if (conversationTyping.size === 0) {
        this.typingStates.delete(conversationID);
      }
    });
  }

  private performCleanup() {
    const now = Date.now();
    const inactiveConnections: string[] = [];

    this.connections.forEach((connectionInfo, socketID) => {
      if (now - connectionInfo.lastActivity > INACTIVITY_TIMEOUT) {
        inactiveConnections.push(socketID);
      }
    });

    inactiveConnections.forEach(socketID => {
      const socket = this.server.sockets.sockets.get(socketID);
      if (socket) {
        this.logger.log(`🧹 Disconnecting inactive connection: ${socketID}`);
        socket.disconnect();
      }
    });

    this.roomMembers.forEach((members, roomID) => {
      if (members.size === 0) {
        this.roomMembers.delete(roomID);
      }
    });

    this.typingStates.forEach((conversationTyping, conversationID) => {
      if (conversationTyping.size === 0) {
        this.typingStates.delete(conversationID);
      }
    });

    if (inactiveConnections.length > 0) {
      this.logger.log(`🧹 Cleaned up ${inactiveConnections.length} inactive connections`);
    }
  }

  private cleanup() {
    this.typingStates.forEach((conversationTyping) => {
      conversationTyping.forEach((timeout) => {
        clearTimeout(timeout);
      });
    });

    this.connections.forEach(connection => {
      if (connection.heartbeatInterval) {
        clearInterval(connection.heartbeatInterval);
      }
    });

    this.connections.clear();
    this.roomMembers.clear();
    this.typingStates.clear();
    this.conversationViewers.clear();

    this.presenceService.cleanup();
  }

  getConnectionStats() {
    return {
      totalConnections: this.connections.size,
      totalRooms: this.roomMembers.size,
      totalTypingStates: this.typingStates.size,
      connections: Array.from(this.connections.entries()).map(([socketID, info]) => ({
        socketID,
        userID: info.userID,
        userType: info.userType,
        joinedRooms: Array.from(info.joinedRooms),
        lastActivity: new Date(info.lastActivity).toISOString(),
      })),
    };
  }
}
