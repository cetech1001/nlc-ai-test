import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { DripScheduleController } from './drip-schedule.controller';
import { DripScheduleService } from './drip-schedule.service';
import { PaywallController } from './paywall.controller';
import { PaywallService } from './paywall.service';

@Module({
  controllers: [CoursesController, ChaptersController, LessonsController, DripScheduleController, PaywallController],
  providers: [CoursesService, ChaptersService, LessonsService, DripScheduleService, PaywallService],
  exports: [CoursesService, ChaptersService, LessonsService, DripScheduleService, PaywallService],
})
export class CoursesModule {}
