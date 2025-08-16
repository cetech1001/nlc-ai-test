import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import {ProxyModule} from "../proxy/proxy.module";
import {CacheModule} from "../cache/cache.module";

@Module({
  imports: [ProxyModule, CacheModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
