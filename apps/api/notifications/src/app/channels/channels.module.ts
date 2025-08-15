import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailChannelService } from './email/email-channel.service';
import { PushChannelService } from './push/push-channel.service';
import { WebhookChannelService } from './webhook/webhook-channel.service';
import { PreferencesModule } from '../preferences/preferences.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    PreferencesModule,
  ],
  providers: [
    EmailChannelService,
    PushChannelService,
    WebhookChannelService,
  ],
  exports: [
    EmailChannelService,
    PushChannelService,
    WebhookChannelService,
  ],
})
export class ChannelsModule {}
