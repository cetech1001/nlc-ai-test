import { Module } from '@nestjs/common';
import { ClientCoachController } from './client-coach.controller';
import { InvitesController } from './invites.controller';
import { ClientCoachService } from './client-coach.service';
import { InvitesService } from './invites.service';

@Module({
  controllers: [ClientCoachController, InvitesController],
  providers: [ClientCoachService, InvitesService],
  exports: [ClientCoachService, InvitesService],
})
export class RelationshipsModule {}
