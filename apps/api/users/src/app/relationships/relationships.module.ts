import { Module } from '@nestjs/common';
import { ClientCoachController } from './controllers/client-coach.controller';
import { InvitesController } from './controllers/invites.controller';
import { ClientCoachService } from './services/client-coach.service';
import { InvitesService } from './services/invites.service';

@Module({
  controllers: [ClientCoachController, InvitesController],
  providers: [ClientCoachService, InvitesService],
  exports: [ClientCoachService, InvitesService],
})
export class RelationshipsModule {}
