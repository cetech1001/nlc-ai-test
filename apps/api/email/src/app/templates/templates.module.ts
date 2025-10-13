import { Module } from '@nestjs/common';
import {TemplateEngineService} from "./services/template-engine.service";

@Module({
  providers: [TemplateEngineService],
  exports: [TemplateEngineService],
})
export class TemplatesModule {}
