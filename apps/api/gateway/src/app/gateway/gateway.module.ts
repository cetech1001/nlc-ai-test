import { Module } from '@nestjs/common';
import { ProxyModule } from '../proxy/proxy.module';
import { CacheModule } from '../cache/cache.module';
import { SecurityModule } from '../security/security.module';
import { AuthGatewayController } from './controllers/auth-gateway.controller';
import { UsersGatewayController } from './controllers/users-gateway.controller';
import { MediaGatewayController } from './controllers/media-gateway.controller';
import { EmailGatewayController } from './controllers/email-gateway.controller';
import { BillingGatewayController } from './controllers/billing-gateway.controller';
import { LeadsGatewayController } from './controllers/leads-gateway.controller';
import { NotificationsGatewayController } from './controllers/notifications-gateway.controller';
import {IntegrationsGatewayController} from "./controllers/integrations-gateway.controller";
import {CommunitiesGatewayController} from "./controllers/communities-gateway.controller";
import {AnalyticsGatewayController} from "./controllers/analytics-gateway.controller";
import {AgentsGatewayController} from "./controllers/agents-gateway.controller";
import {MessagesGatewayController} from "./controllers/messages-gateway.controller";
import {WebSocketProxyGateway} from "./websocket-proxy.gateway";
import {CoursesGatewayController} from "./controllers/courses-gateway.controller";

@Module({
  imports: [ProxyModule, CacheModule, SecurityModule],
  controllers: [
    AgentsGatewayController,
    AnalyticsGatewayController,
    AuthGatewayController,
    UsersGatewayController,
    MediaGatewayController,
    EmailGatewayController,
    BillingGatewayController,
    LeadsGatewayController,
    NotificationsGatewayController,
    IntegrationsGatewayController,
    CommunitiesGatewayController,
    MessagesGatewayController,
    CoursesGatewayController,
  ],
  providers: [WebSocketProxyGateway],
})
export class GatewayModule {}
