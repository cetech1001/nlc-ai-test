import { Module } from '@nestjs/common';
import { AuthEventsHandler } from './handlers/auth-events.handler';
import { CourseEventsHandler } from './handlers/course-events.handler';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [CommunitiesModule],
  providers: [
    AuthEventsHandler,
    CourseEventsHandler,
  ],
  exports: [
    AuthEventsHandler,
    CourseEventsHandler,
  ],
})
export class EventHandlersModule {}
