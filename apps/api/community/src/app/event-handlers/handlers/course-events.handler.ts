import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { UserType } from '@nlc-ai/api-types';
import { CommunityType, CommunityVisibility, MemberRole } from '@nlc-ai/api-types';
import { CommunityService } from '../../community/community.service';
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class CourseEventsHandler {
  private readonly logger = new Logger(CourseEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly communityService: CommunityService,
    private readonly prisma: PrismaService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'community-service.course-events',
      [
        'course.created',
        'course.enrollment.created',
        'course.enrollment.completed',
      ],
      this.handleCourseEvents.bind(this)
    );
  }

  private async handleCourseEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'course.created':
          await this.handleCourseCreated(payload);
          break;
        case 'course.enrollment.created':
          await this.handleCourseEnrollment(payload);
          break;
        case 'course.enrollment.completed':
          await this.handleCourseCompleted(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle course event:', error);
    }
  }

  private async handleCourseCreated(payload: any) {
    try {
      // Create a community for the course
      const community = await this.communityService.createCommunity({
        name: `${payload.title} - Course Community`,
        description: `Community for students and instructors of ${payload.title}`,
        type: CommunityType.COURSE,
        visibility: CommunityVisibility.INVITE_ONLY,
        courseID: payload.courseID,
        coachID: payload.coachID,
      }, payload.coachID, UserType.coach);

      this.logger.log(`Course community created: ${community.id} for course ${payload.courseID}`);
    } catch (error) {
      this.logger.error(`Failed to create community for course ${payload.courseID}:`, error);
    }
  }

  private async handleCourseEnrollment(payload: any) {
    try {
      // Find the course community and add the client
      const community = await this.prisma.community.findFirst({
        where: {
          type: CommunityType.COURSE,
          courseID: payload.courseID,
        },
      });

      if (community) {
        await this.communityService.addMemberToCommunity(
          community.id,
          payload.clientID,
          UserType.client,
          MemberRole.MEMBER,
          payload.coachID
        );

        this.logger.log(`Client ${payload.clientID} added to course community for course ${payload.courseID}`);
      }
    } catch (error) {
      this.logger.error(`Failed to add client to course community:`, error);
    }
  }

  private async handleCourseCompleted(payload: any) {
    // Course completion doesn't require community changes
    // but we could add special recognition or privileges here
    this.logger.log(`Client ${payload.clientID} completed course ${payload.courseID}`);
  }
}
