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

@Module({
  imports: [ProxyModule, CacheModule, SecurityModule],
  controllers: [
    AuthGatewayController,
    UsersGatewayController,
    MediaGatewayController,
    EmailGatewayController,
    BillingGatewayController,
    LeadsGatewayController,
    NotificationsGatewayController,
  ],
})
export class GatewayModule {}
