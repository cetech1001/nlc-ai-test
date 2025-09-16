import { Module } from '@nestjs/common';
import { TransactionalService } from './transactional.service';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [ProvidersModule],
  providers: [TransactionalService],
  exports: [TransactionalService],
})
export class TransactionalModule {}
