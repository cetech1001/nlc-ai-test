import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';

@Module({
  imports: [
    TerminusModule,
    OrchestratorModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
