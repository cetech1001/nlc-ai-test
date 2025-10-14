import { Module } from '@nestjs/common';
import { ClientEmailController } from './client-email.controller';
import { ClientEmailService } from './client-email.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ClientEmailController],
  providers: [ClientEmailService],
  exports: [ClientEmailService],
})
export class ClientEmailModule {}
