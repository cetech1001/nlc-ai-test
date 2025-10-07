import { Module } from '@nestjs/common';
import { ReplicaController } from './replica.controller';
import { ReplicaService } from './replica.service';

@Module({
  controllers: [ReplicaController],
  providers: [ReplicaService],
  exports: [ReplicaService],
})
export class ReplicaModule {}
