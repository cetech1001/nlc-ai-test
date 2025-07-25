import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import {IntegrationsModule} from "../integrations/integrations.module";
import {EmailAccountsModule} from "../email-accounts/email-accounts.module";

@Module({
  imports: [
    IntegrationsModule,
    EmailAccountsModule,
  ],
  controllers: [OAuthController],
})
export class OauthModule {}
