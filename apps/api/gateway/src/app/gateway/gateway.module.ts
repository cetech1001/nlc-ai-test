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
import {CommunityGatewayController} from "./controllers/community-gateway.controller";
import {AnalyticsGatewayController} from "./controllers/analytics-gateway.controller";
import {AgentsGatewayController} from "./controllers/agents-gateway.controller";
import {MessagingGatewayController} from "./controllers/messaging-gateway.controller";

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
    CommunityGatewayController,
    MessagingGatewayController,
  ],
})
export class GatewayModule {}
