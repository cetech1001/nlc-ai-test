import { Module } from '@nestjs/common';
import { CourseStructureController } from './course-structure.controller';
import { CourseStructureService } from './course-structure.service';

@Module({
  controllers: [CourseStructureController],
  providers: [CourseStructureService],
  exports: [CourseStructureService],
})
export class CourseStructureModule {}
