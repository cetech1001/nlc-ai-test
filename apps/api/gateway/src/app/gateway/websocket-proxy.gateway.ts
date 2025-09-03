// apps/api/gateway/src/app/gateway/websocket-proxy.gateway.ts
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

interface ClientConnection {
  clientID: string;
  serviceSocket: ClientSocket;
  userID: string;
  userType: string;
  joinedRooms: Set<string>;
  lastActivity: number;
  isConnected: boolean;
}

interface PendingEvent {
  eventName: string;
  args: any[];
  timestamp: number;
}

const CONNECTION_TIMEOUT = 10000; // 10 seconds
const CLEANUP_INTERVAL = 30000; // 30 seconds
const INACTIVITY_TIMEOUT = 300000; // 5 minutes
const EVENT_BUFFER_TIMEOUT = 5000; // 5 seconds
const MAX_PENDING_EVENTS = 50; // Maximum events to buffer per client

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

  // Efficient data structures for better memory management
  private clientConnections = new Map<string, ClientConnection>();
  private roomMemberships = new Map<string, Set<string>>(); // roomName -> clientIDs
  private pendingEvents = new Map<string, PendingEvent[]>(); // clientID -> buffered events
  private cleanupInterval: NodeJS.Timeout;
  private connectionTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(private readonly serviceRegistry: ServiceRegistryService) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized');

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, CLEANUP_INTERVAL);
  }

  onModuleDestroy() {
    this.cleanup();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
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

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        this.logger.error(`⏰ Connection timeout for client ${client.id}`);
        this.cleanupClient(client.id);
        client.emit('connect_error', { message: 'Connection timeout' });
        client.disconnect();
      }, CONNECTION_TIMEOUT);

      this.connectionTimeouts.set(client.id, connectionTimeout);

      const serviceClient = ioClient(messagingService.url, {
        auth: client.handshake.auth,
        query: client.handshake.query,
        extraHeaders: client.handshake.headers as Record<string, string>,
        transports: ['websocket', 'polling'],
        forceNew: true,
        timeout: CONNECTION_TIMEOUT,
        reconnection: false, // We'll handle reconnection at gateway level
      });

      // Store connection info
      const clientConnection: ClientConnection = {
        clientID: client.id,
        serviceSocket: serviceClient,
        userID: client.handshake.auth?.userID || 'unknown',
        userType: client.handshake.auth?.userType || 'unknown',
        joinedRooms: new Set(),
        lastActivity: Date.now(),
        isConnected: false,
      };

      this.clientConnections.set(client.id, clientConnection);

      // Handle service connection events
      serviceClient.on('connect', () => {
        // Clear connection timeout
        const timeout = this.connectionTimeouts.get(client.id);
        if (timeout) {
          clearTimeout(timeout);
          this.connectionTimeouts.delete(client.id);
        }

        clientConnection.isConnected = true;
        clientConnection.lastActivity = Date.now();

        this.logger.log(`✅ Gateway: Client ${client.id} connected to messaging service (${serviceClient.id})`);

        // Process buffered events
        this.processPendingEvents(client.id);

        client.emit('gateway_ready', { message: 'Connected through gateway' });
      });

      serviceClient.on('disconnect', (reason) => {
        this.logger.log(`❌ Gateway: Service connection for client ${client.id} disconnected: ${reason}`);
        clientConnection.isConnected = false;
        client.emit('service_disconnected', { reason });

        // Don't immediately disconnect client - allow for potential reconnection
        setTimeout(() => {
          if (!clientConnection.isConnected) {
            client.disconnect();
          }
        }, 5000);
      });

      serviceClient.on('connect_error', (error) => {
        this.logger.error(`🚫 Gateway: Service connection error for client ${client.id}:`, error.message);
        this.cleanupClient(client.id);
        client.emit('connect_error', {
          message: 'Failed to connect to messaging service',
          error: error.message
        });
        client.disconnect();
      });

      // Forward client events to service with rate limiting
      client.onAny((eventName: string, ...args: any[]) => {
        this.updateClientActivity(client.id);

        if (clientConnection.isConnected && serviceClient.connected) {
          this.logger.debug(`➡️ Gateway: Forwarding client event: ${eventName}`);

          // Handle room management events
          this.handleRoomEvent(client.id, eventName, args);

          serviceClient.emit(eventName, ...args);
        } else {
          // Buffer events with limits
          this.bufferEvent(client.id, eventName, args);
        }
      });

      // Forward service events to client with filtering
      serviceClient.onAny((eventName: string, ...args: any[]) => {
        this.logger.debug(`⬅️ Gateway: Received service event: ${eventName}`);

        if (this.isBroadcastEvent(eventName, args)) {
          this.logger.log(`📡 Gateway: Handling broadcast event: ${eventName}`);
          this.handleBroadcastEvent(eventName, args);
        } else {
          // Direct event to the specific client
          if (client.connected) {
            this.logger.debug(`📤 Gateway: Forwarding direct event to client ${client.id}: ${eventName}`);
            client.emit(eventName, ...args);
          }
        }
      });

    } catch (error) {
      this.logger.error('💥 Gateway: Error handling client connection:', error);
      this.cleanupClient(client.id);
      client.emit('connect_error', { message: 'Gateway connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.cleanupClient(client.id);
    this.logger.log(`🔌 Gateway: Client ${client.id} disconnected`);
  }

  private updateClientActivity(clientID: string) {
    const connection = this.clientConnections.get(clientID);
    if (connection) {
      connection.lastActivity = Date.now();
    }
  }

  private handleRoomEvent(clientID: string, eventName: string, args: any[]) {
    const connection = this.clientConnections.get(clientID);
    if (!connection) return;

    if (eventName === 'join_conversation') {
      const payload = args[0];
      if (payload?.conversationID) {
        const roomName = `conversation:${payload.conversationID}`;

        // Add to client's joined rooms
        connection.joinedRooms.add(roomName);

        // Add to room membership
        if (!this.roomMemberships.has(roomName)) {
          this.roomMemberships.set(roomName, new Set());
        }
        this.roomMemberships.get(roomName)!.add(clientID);

        this.logger.log(`📍 Gateway: Client ${clientID} joined room: ${roomName}`);
      }
    } else if (eventName === 'leave_conversation') {
      const payload = args[0];
      if (payload?.conversationID) {
        const roomName = `conversation:${payload.conversationID}`;

        // Remove from client's joined rooms
        connection.joinedRooms.delete(roomName);

        // Remove from room membership
        const roomMembers = this.roomMemberships.get(roomName);
        if (roomMembers) {
          roomMembers.delete(clientID);
          if (roomMembers.size === 0) {
            this.roomMemberships.delete(roomName);
          }
        }

        this.logger.log(`🚪 Gateway: Client ${clientID} left room: ${roomName}`);
      }
    }
  }

  private bufferEvent(clientID: string, eventName: string, args: any[]) {
    if (!this.pendingEvents.has(clientID)) {
      this.pendingEvents.set(clientID, []);
    }

    const events = this.pendingEvents.get(clientID)!;

    // Prevent buffer overflow
    if (events.length >= MAX_PENDING_EVENTS) {
      this.logger.warn(`⚠️ Gateway: Event buffer full for client ${clientID}, dropping oldest events`);
      events.splice(0, 10); // Remove oldest 10 events
    }

    events.push({
      eventName,
      args,
      timestamp: Date.now(),
    });

    this.logger.debug(`📦 Gateway: Buffering event until service connects: ${eventName} (${events.length} total)`);
  }

  private processPendingEvents(clientID: string) {
    const events = this.pendingEvents.get(clientID);
    if (!events || events.length === 0) return;

    const connection = this.clientConnections.get(clientID);
    if (!connection || !connection.isConnected) return;

    this.logger.log(`🔄 Gateway: Processing ${events.length} buffered events for client ${clientID}`);

    const now = Date.now();
    let processedCount = 0;

    events.forEach(({ eventName, args, timestamp }) => {
      // Skip events that are too old
      if (now - timestamp > EVENT_BUFFER_TIMEOUT) {
        this.logger.debug(`⏰ Gateway: Skipping expired event: ${eventName}`);
        return;
      }

      this.logger.debug(`🔄 Gateway: Processing buffered event: ${eventName}`);
      connection.serviceSocket.emit(eventName, ...args);
      processedCount++;
    });

    this.pendingEvents.delete(clientID);
    this.logger.log(`✅ Gateway: Processed ${processedCount}/${events.length} buffered events for client ${clientID}`);
  }

  private cleanupClient(clientID: string) {
    const connection = this.clientConnections.get(clientID);

    if (connection) {
      // Disconnect service socket
      if (connection.serviceSocket && connection.serviceSocket.connected) {
        connection.serviceSocket.disconnect();
      }

      // Clean up room memberships
      connection.joinedRooms.forEach(roomName => {
        const roomMembers = this.roomMemberships.get(roomName);
        if (roomMembers) {
          roomMembers.delete(clientID);
          if (roomMembers.size === 0) {
            this.roomMemberships.delete(roomName);
          }
        }
      });

      this.clientConnections.delete(clientID);
    }

    // Clear pending events
    this.pendingEvents.delete(clientID);

    // Clear connection timeout
    const timeout = this.connectionTimeouts.get(clientID);
    if (timeout) {
      clearTimeout(timeout);
      this.connectionTimeouts.delete(clientID);
    }
  }

  private performCleanup() {
    const now = Date.now();
    const inactiveClients: string[] = [];

    // Find inactive clients
    this.clientConnections.forEach((connection, clientID) => {
      if (now - connection.lastActivity > INACTIVITY_TIMEOUT || !connection.isConnected) {
        inactiveClients.push(clientID);
      }
    });

    // Clean up inactive clients
    inactiveClients.forEach(clientID => {
      this.logger.log(`🧹 Gateway: Cleaning up inactive client: ${clientID}`);
      const socket = this.server.sockets.sockets.get(clientID);
      if (socket) {
        socket.disconnect();
      } else {
        this.cleanupClient(clientID);
      }
    });

    // Clean up empty room memberships
    this.roomMemberships.forEach((members, roomName) => {
      if (members.size === 0) {
        this.roomMemberships.delete(roomName);
      }
    });

    // Clean up expired pending events
    this.pendingEvents.forEach((events, clientID) => {
      const validEvents = events.filter(event => now - event.timestamp < EVENT_BUFFER_TIMEOUT);

      if (validEvents.length === 0) {
        this.pendingEvents.delete(clientID);
      } else if (validEvents.length !== events.length) {
        this.pendingEvents.set(clientID, validEvents);
      }
    });

    if (inactiveClients.length > 0) {
      this.logger.log(`🧹 Gateway: Cleaned up ${inactiveClients.length} inactive connections`);
    }
  }

  private cleanup() {
    // Clear all timeouts
    this.connectionTimeouts.forEach(timeout => clearTimeout(timeout));
    this.connectionTimeouts.clear();

    // Disconnect all service sockets
    this.clientConnections.forEach(connection => {
      if (connection.serviceSocket && connection.serviceSocket.connected) {
        connection.serviceSocket.disconnect();
      }
    });

    // Clear all data structures
    this.clientConnections.clear();
    this.roomMemberships.clear();
    this.pendingEvents.clear();
  }

  private isBroadcastEvent(eventName: string, args: any[]): boolean {
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
        this.logger.debug(`⚠️ Client ${clientID} not found or disconnected, cleaning up`);
        roomMembers.delete(clientID);
        this.cleanupClient(clientID);
      }
    });
  }

  // Get connection stats for monitoring
  getConnectionStats() {
    return {
      totalConnections: this.clientConnections.size,
      totalRooms: this.roomMemberships.size,
      totalPendingEvents: Array.from(this.pendingEvents.values()).reduce((sum, events) => sum + events.length, 0),
      connections: Array.from(this.clientConnections.entries()).map(([clientID, connection]) => ({
        clientID,
        userID: connection.userID,
        userType: connection.userType,
        isConnected: connection.isConnected,
        joinedRooms: Array.from(connection.joinedRooms),
        lastActivity: new Date(connection.lastActivity).toISOString(),
        pendingEvents: this.pendingEvents.get(clientID)?.length || 0,
      })),
    };
  }
}
