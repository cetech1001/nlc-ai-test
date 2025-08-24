import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';

interface AuthenticatedSocket extends Socket {
  userID: string;
  userType: UserType;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  path: '/api/notifications/socket.io',
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');
  private connectedClients = new Map<string, AuthenticatedSocket>();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized for notifications');
  }

  @UseGuards(JwtAuthGuard)
  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Extract user info from JWT token
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Client attempted connection without token');
        client.disconnect();
        return;
      }

      // TODO: Validate JWT token and extract user info
      // For now, mock the auth process
      const userID = client.handshake.auth?.userID;
      const userType = client.handshake.auth?.userType;

      if (!userID || !userType) {
        this.logger.warn('Invalid user credentials in WebSocket connection');
        client.disconnect();
        return;
      }

      const authenticatedClient = client as AuthenticatedSocket;
      authenticatedClient.userID = userID;
      authenticatedClient.userType = userType;

      // Store client connection
      this.connectedClients.set(client.id, authenticatedClient);

      // Join user-specific room
      const roomName = `user:${userType}:${userID}`;
      await client.join(roomName);

      this.logger.log(`Client ${client.id} connected for user ${userID} (${userType})`);

      // Send connection acknowledgment
      client.emit('connected', {
        message: 'Connected to notifications',
        userID,
        userType,
      });

    } catch (error) {
      this.logger.error('Error during client connection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const authenticatedClient = this.connectedClients.get(client.id);
    if (authenticatedClient) {
      this.logger.log(`Client ${client.id} disconnected for user ${authenticatedClient.userID}`);
      this.connectedClients.delete(client.id);
    }
  }

  @SubscribeMessage('subscribe-notifications')
  async handleSubscription(client: AuthenticatedSocket, data: any) {
    const roomName = `user:${client.userType}:${client.userID}`;
    await client.join(roomName);

    this.logger.log(`Client ${client.id} subscribed to notifications`);
    client.emit('subscribed', { message: 'Subscribed to notifications' });
  }

  // Method to send notification to specific user
  async sendToUser(userID: string, userType: UserType, notification: any) {
    const roomName = `user:${userType}:${userID}`;

    this.server.to(roomName).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Sent notification to user ${userID} (${userType})`);
  }

  // Method to broadcast to all connected clients
  async broadcast(notification: any) {
    this.server.emit('broadcast-notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    this.logger.log('Broadcasted notification to all clients');
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get connected clients for specific user
  getClientsByUser(userID: string, userType: UserType): AuthenticatedSocket[] {
    return Array.from(this.connectedClients.values()).filter(
      client => client.userID === userID && client.userType === userType
    );
  }
}
