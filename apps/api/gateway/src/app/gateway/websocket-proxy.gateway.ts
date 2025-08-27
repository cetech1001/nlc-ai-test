import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { ServiceRegistryService } from '../proxy/service-registry.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS,
    credentials: process.env.CORS_CREDENTIALS,
  },
  path: '/api/messages/socket.io',
})
export class WebSocketProxyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebSocketProxyGateway.name);
  private clientConnections = new Map<string, ClientSocket>(); // client socketID -> service socket
  private serviceToClients = new Map<string, Set<string>>(); // service socketID -> client socketIDs
  private roomMemberships = new Map<string, Set<string>>(); // roomName -> client socketIDs

  constructor(private readonly serviceRegistry: ServiceRegistryService) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`🔌 Gateway: Client ${client.id} connecting...`);

      const messagingService = this.serviceRegistry.getService('messaging');
      if (!messagingService) {
        this.logger.error('❌ Messaging service not found in registry');
        client.emit('connect_error', { message: 'Messaging service unavailable' });
        client.disconnect();
        return;
      }

      this.logger.log(`🎯 Gateway: Connecting to messaging service at ${messagingService.url}`);

      const serviceClient = ioClient(messagingService.url, {
        auth: client.handshake.auth,
        query: client.handshake.query,
        extraHeaders: client.handshake.headers as Record<string, string>,
        transports: ['websocket', 'polling'],
        forceNew: true,
        timeout: 10000,
      });

      this.clientConnections.set(client.id, serviceClient);

      // Track service connection mapping
      serviceClient.on('connect', () => {
        const serviceSocketID = serviceClient.id!;
        if (!this.serviceToClients.has(serviceSocketID)) {
          this.serviceToClients.set(serviceSocketID, new Set());
        }
        this.serviceToClients.get(serviceSocketID)!.add(client.id);

        this.logger.log(`✅ Gateway: Client ${client.id} connected to messaging service (${serviceSocketID})`);
        client.emit('gateway_ready', { message: 'Connected through gateway' });
      });

      // Forward all client events to service
      client.onAny((eventName: string, ...args: any[]) => {
        if (serviceClient.connected) {
          this.logger.debug(`➡️ Gateway: Forwarding client event: ${eventName}`);

          // Special handling for room events to track memberships
          if (eventName === 'join_conversation') {
            const payload = args[0];
            if (payload?.conversationID) {
              const roomName = `conversation:${payload.conversationID}`;
              if (!this.roomMemberships.has(roomName)) {
                this.roomMemberships.set(roomName, new Set());
              }
              this.roomMemberships.get(roomName)!.add(client.id);
              this.logger.debug(`📍 Client ${client.id} joined room: ${roomName}`);
            }
          } else if (eventName === 'leave_conversation') {
            const payload = args[0];
            if (payload?.conversationID) {
              const roomName = `conversation:${payload.conversationID}`;
              this.roomMemberships.get(roomName)?.delete(client.id);
              this.logger.debug(`🚪 Client ${client.id} left room: ${roomName}`);
            }
          }

          serviceClient.emit(eventName, ...args);
        } else {
          this.logger.warn(`⚠️ Gateway: Service not connected, dropping client event: ${eventName}`);
        }
      });

      // Forward all service events to client(s)
      serviceClient.onAny((eventName: string, ...args: any[]) => {
        this.logger.debug(`⬅️ Gateway: Received service event: ${eventName}`);

        // Check if this is a broadcast event that should go to specific rooms
        if (this.isBroadcastEvent(eventName, args)) {
          this.handleBroadcastEvent(eventName, args);
        } else {
          // Direct event to the specific client
          client.emit(eventName, ...args);
        }
      });

      serviceClient.on('disconnect', (reason) => {
        this.logger.log(`❌ Gateway: Service connection for client ${client.id} disconnected: ${reason}`);
        this.cleanupClient(client.id);
        client.emit('service_disconnected', { reason });
        client.disconnect();
      });

      serviceClient.on('connect_error', (error) => {
        this.logger.error(`🚫 Gateway: Service connection error for client ${client.id}:`, error.message);
        client.emit('connect_error', {
          message: 'Failed to connect to messaging service',
          error: error.message
        });
        client.disconnect();
      });

    } catch (error) {
      this.logger.error('💥 Gateway: Error handling client connection:', error);
      client.emit('connect_error', { message: 'Gateway connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.cleanupClient(client.id);
    this.logger.log(`🔌 Gateway: Client ${client.id} disconnected`);
  }

  private cleanupClient(clientID: string) {
    // Disconnect service connection
    const serviceClient = this.clientConnections.get(clientID);
    if (serviceClient) {
      serviceClient.disconnect();
      this.clientConnections.delete(clientID);
    }

    // Remove from service mappings
    this.serviceToClients.forEach((clients, serviceID) => {
      clients.delete(clientID);
      if (clients.size === 0) {
        this.serviceToClients.delete(serviceID);
      }
    });

    // Remove from room memberships
    this.roomMemberships.forEach((clients, roomName) => {
      clients.delete(clientID);
      if (clients.size === 0) {
        this.roomMemberships.delete(roomName);
      }
    });
  }

  private isBroadcastEvent(eventName: string, args: any[]): boolean {
    // Events that should be broadcast to rooms
    const broadcastEvents = [
      'new_message',
      'message_updated',
      'message_deleted',
      'messages_read',
      'user_typing'
    ];

    return broadcastEvents.includes(eventName) &&
      args[0] &&
      typeof args[0] === 'object' &&
      args[0].conversationID;
  }

  private handleBroadcastEvent(eventName: string, args: any[]) {
    const eventData = args[0];
    const conversationID = eventData.conversationID;

    if (!conversationID) {
      this.logger.warn(`⚠️ No conversationID found in broadcast event: ${eventName}`);
      return;
    }

    const roomName = `conversation:${conversationID}`;
    const roomMembers = this.roomMemberships.get(roomName);

    if (!roomMembers || roomMembers.size === 0) {
      this.logger.debug(`📭 No clients in room ${roomName} for event ${eventName}`);
      return;
    }

    this.logger.debug(`📡 Broadcasting ${eventName} to ${roomMembers.size} clients in room ${roomName}`);

    // Send to all clients in the room
    roomMembers.forEach(clientID => {
      const client = this.server.sockets.sockets.get(clientID);
      if (client && client.connected) {
        client.emit(eventName, ...args);
        this.logger.debug(`📤 Sent ${eventName} to client ${clientID}`);
      } else {
        this.logger.debug(`⚠️ Client ${clientID} not found or disconnected, removing from room`);
        roomMembers.delete(clientID);
      }
    });
  }
}
