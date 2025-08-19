import { Module } from '@nestjs/common';
import { AuthEventsHandler } from './handlers/auth-events.handler';
import { CourseEventsHandler } from './handlers/course-events.handler';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [CommunityModule],
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
