import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import {IntegrationsModule} from "../integrations/integrations.module";

@Module({
  imports: [IntegrationsModule],
  controllers: [OAuthController],
})
export class OauthModule {}
