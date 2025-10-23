import { Module } from '@nestjs/common';
import { AuthHandler } from './handlers/auth.handler';
import { CoursesHandler } from './handlers/courses.handler';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [CommunitiesModule],
  providers: [
    AuthHandler,
    CoursesHandler,
  ],
  exports: [
    AuthHandler,
    CoursesHandler,
  ],
})
export class EventsModule {}
