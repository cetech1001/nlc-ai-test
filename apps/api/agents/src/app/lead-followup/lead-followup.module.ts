import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LeadFollowupController } from './lead-followup.controller';
import { LeadFollowupService } from './lead-followup.service';

@Module({
  imports: [HttpModule],
  controllers: [LeadFollowupController],
  providers: [LeadFollowupService],
  exports: [LeadFollowupService],
})
export class LeadFollowupModule {}
