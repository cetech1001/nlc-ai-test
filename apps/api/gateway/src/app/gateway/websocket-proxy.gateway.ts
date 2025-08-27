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
    origin: process.env.CORS_ORIGINS,
    credentials: process.env.CORS_CREDENTIALS,
  },
  path: '/api/messages/socket.io',
})
export class WebSocketProxyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebSocketProxyGateway.name);
  private clientConnections = new Map<string, ClientSocket>();

  constructor(private readonly serviceRegistry: ServiceRegistryService) {}

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

      client.onAny((eventName: string, ...args: any[]) => {
        if (serviceClient.connected) {
          this.logger.debug(`➡️ Gateway: Forwarding event to service: ${eventName}`);
          serviceClient.emit(eventName, ...args);
        } else {
          this.logger.warn(`⚠️ Gateway: Service not connected, dropping event: ${eventName}`);
        }
      });

      serviceClient.onAny((eventName: string, ...args: any[]) => {
        this.logger.debug(`⬅️ Gateway: Forwarding event to client: ${eventName}`);
        client.emit(eventName, ...args);
      });

      serviceClient.on('connect', () => {
        this.logger.log(`✅ Gateway: Client ${client.id} connected to messaging service`);
        client.emit('gateway_ready', { message: 'Connected through gateway' });
      });

      serviceClient.on('disconnect', (reason) => {
        this.logger.log(`❌ Gateway: Service connection for client ${client.id} disconnected: ${reason}`);
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
    const serviceClient = this.clientConnections.get(client.id);
    if (serviceClient) {
      serviceClient.disconnect();
      this.clientConnections.delete(client.id);
    }
    this.logger.log(`🔌 Gateway: Client ${client.id} disconnected`);
  }
}
