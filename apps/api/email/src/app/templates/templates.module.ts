import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import {TemplateEngineService} from "./services/template-engine.service";

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplateEngineService],
  exports: [TemplatesService, TemplateEngineService],
})
export class TemplatesModule {}
