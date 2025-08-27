import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { ServiceRegistryService } from '../proxy/service-registry.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4300', 'http://localhost:4400'],
    credentials: true,
  },
  path: '/api/messages/socket.io', // Custom path but no namespace
})
export class WebSocketProxyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebSocketProxyGateway.name);
  private clientConnections = new Map<string, ClientSocket>();

  constructor(private readonly serviceRegistry: ServiceRegistryService) {}

  async handleConnection(client: Socket) {
    try {
      // Get the messaging service URL
      const messagingService = this.serviceRegistry.getService('messaging');
      if (!messagingService) {
        this.logger.error('Messaging service not found in registry');
        client.disconnect();
        return;
      }

      // Create connection to actual messaging service with namespace
      const serviceClient = ioClient(`${messagingService.url}/messages`, {
        auth: client.handshake.auth,
        transports: ['websocket'],
        forceNew: true,
        timeout: 5000,
      });

      this.clientConnections.set(client.id, serviceClient);

      // Forward all events from client to service
      client.onAny((eventName: string, ...args: any[]) => {
        if (serviceClient.connected) {
          this.logger.debug(`Forwarding event to service: ${eventName}`);
          serviceClient.emit(eventName, ...args);
        }
      });

      // Forward all events from service to client
      serviceClient.onAny((eventName: string, ...args: any[]) => {
        this.logger.debug(`Forwarding event to client: ${eventName}`);
        client.emit(eventName, ...args);
      });

      // Handle service connection events
      serviceClient.on('connect', () => {
        this.logger.log(`✅ Client ${client.id} connected to messaging service`);
      });

      serviceClient.on('disconnect', (reason) => {
        this.logger.log(`❌ Service connection for client ${client.id} disconnected: ${reason}`);
        client.disconnect();
      });

      serviceClient.on('connect_error', (error) => {
        this.logger.error(`🚫 Service connection error for client ${client.id}:`, error.message);
        client.emit('connect_error', { message: 'Failed to connect to messaging service', error: error.message });
      });

      this.logger.log(`🔌 Gateway: Client ${client.id} connected, establishing service connection...`);
    } catch (error) {
      this.logger.error('❌ Error handling client connection:', error);
      client.emit('connect_error', { message: 'Gateway connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const serviceClient = this.clientConnections.get(client.id);
    if (serviceClient) {
      serviceClient.disconnect();
      this.clientConnections.delete(client.id);
    }
    this.logger.log(`🔌 Gateway: Client ${client.id} disconnected`);
  }
}
