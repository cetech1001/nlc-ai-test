import { Module } from '@nestjs/common';
import { EmailAgentController } from './email-agent.controller';
import { EmailAgentService } from './email-agent.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [EmailAgentController],
  providers: [EmailAgentService],
  exports: [EmailAgentService],
})
export class EmailAgentModule {}
