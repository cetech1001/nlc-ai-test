import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';

@Module({
  imports: [
    DatabaseModule,
    MessagingModule.forRoot(),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
