import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {EventBusService} from '@nlc-ai/api-messaging';
import {UserType} from '@nlc-ai/api-types';
import {NotificationsService} from '../../notifications/notifications.service';
import {CommunityMember} from "@prisma/client";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class CommunityHandler implements OnApplicationBootstrap {
  private readonly logger = new Logger(CommunityHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onApplicationBootstrap() {
    await this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    try {
      await this.eventBus.subscribe(
        'notifications-service.community-events',
        [
          'community.post.created',
          'community.post.liked',
          'community.post.commented',
          'community.member.joined',
          'community.member.invited',
        ],
        this.handleCommunityEvent.bind(this)
      );

      this.logger.log('✅ Subscribed to community events');
    } catch (error) {
      this.logger.error('❌ Failed to subscribe to community events:', error);
    }
  }

  private async handleCommunityEvent(event: any) {
    try {
      const { eventType, payload } = event;

      this.logger.log(`📢 Received community event: ${eventType}`);

      switch (eventType) {
        case 'community.post.created':
          await this.handlePostCreated(payload);
          break;
        case 'community.post.liked':
          await this.handlePostLiked(payload);
          break;
        case 'community.post.commented':
          await this.handlePostCommented(payload);
          break;
        case 'community.member.joined':
          await this.handleMemberJoined(payload);
          break;
        case 'community.member.invited':
          await this.handleMemberInvited(payload);
          break;
        default:
          this.logger.warn(`Unknown community event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle community event: ${event.eventType}`, error);
    }
  }

  private async handlePostCreated(payload: any) {
    try {
      const membersToNotify = await this.getCommunityMembers(payload.communityID, payload.authorID);

      this.logger.log(`Notifying ${membersToNotify.length} members about new post in ${payload.communityName}`);

      const notifications = await Promise.allSettled(
        membersToNotify.map(member => {
          const authorName = payload.authorType === UserType.admin ? 'Admin' : payload.authorName;
          return this.notificationsService.createNotification({
            userID: member.userID as string,
            userType: member.userType as UserType,
            type: 'post_created',
            title: `New post in ${payload.communityName}`,
            message: `${authorName} created a new post in ${payload.communityName}`,
            actionUrl: `/community/${payload.slug}/post/${payload.postID}`,
            priority: 'normal',
            metadata: {
              communityID: payload.communityID,
              communityName: payload.communityName,
              postID: payload.postID,
              authorID: payload.authorID,
              authorName,
              eventType: 'community.post.created',
            },
          });
        })
      );

      // Count successful notifications
      const successCount = notifications.filter(result => result.status === 'fulfilled').length;
      const failureCount = notifications.filter(result => result.status === 'rejected').length;

      this.logger.log(`Created ${successCount} notifications for post created (${failureCount} failed)`);

      // Log any failures
      notifications.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.warn(`Failed to notify member ${membersToNotify[index].userID}:`, result.reason);
        }
      });

    } catch (error) {
      this.logger.error('Failed to handle post created event:', error);
    }
  }

  private async getCommunityMembers(communityID: string, authorID: string): Promise<Partial<CommunityMember>[]> {
    try {
      return this.prisma.communityMember.findMany({
        where: {
          communityID,
          status: 'active',
          userID: {
            not: authorID,
          }
        },
        select: {
          userID: true,
          userType: true,
          userName: true,
          role: true,
          status: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get community members for ${communityID}:`, error);
      return [];
    }
  }

  private async handlePostLiked(payload: any) {
    if (payload.postAuthorID !== payload.likedByID) {
      const authorName = payload.likedByType === UserType.admin ? 'Admin' : payload.likedByName;
      const notification = await this.notificationsService.createNotification({
        userID: payload.postAuthorID,
        userType: payload.postAuthorType,
        type: 'post_liked',
        title: 'Your post was liked! 👍',
        message: `${authorName} liked your post in ${payload.communityName}`,
        actionUrl: `/community/${payload.slug}/post/${payload.postID}`,
        metadata: {
          communityID: payload.communityID,
          postID: payload.postID,
          likedByID: payload.likedByID,
          reactionType: payload.reactionType,
          eventType: 'community.post.liked',
          communityName: payload.communityName,
          authorName,
        },
      });

      this.logger.log(`Created notification for post liked: ${notification.id}`);
    }
  }

  private async handlePostCommented(payload: any) {
    // Notify the post author that someone commented on their post
    if (payload.postAuthorID !== payload.commentAuthorID) {
      const authorName = payload.commentAuthorType === UserType.admin ? 'Admin' : payload.commentAuthorName;
      const notification = await this.notificationsService.createNotification({
        userID: payload.postAuthorID,
        userType: payload.postAuthorType,
        type: 'post_commented',
        title: 'New comment on your post 💬',
        message: `${authorName} commented on your post in ${payload.communityName}`,
        actionUrl: `/community/${payload.slug}/post/${payload.postID}`,
        metadata: {
          communityID: payload.communityID,
          communityName: payload.communityName,
          authorName,
          postID: payload.postID,
          commentID: payload.commentID,
          commentAuthorID: payload.commentAuthorID,
          eventType: 'community.post.commented',
        },
      });

      this.logger.log(`Created notification for post commented: ${notification.id}`);
    }
  }

  private async handleMemberJoined(payload: any) {
    const notification = await this.notificationsService.createNotification({
      userID: payload.communityOwnerID,
      userType: UserType.coach,
      type: 'member_joined',
      title: 'New community member! 🎉',
      message: `${payload.memberName || 'Someone'} joined ${payload.communityName}`,
      metadata: {
        communityID: payload.communityID,
        memberID: payload.memberID,
        userID: payload.userID,
        eventType: 'community.member.joined',
        communityName: payload.communityName,
        authorName: payload.memberName,
      },
    });

    this.logger.log(`Created notification for member joined: ${notification.id}`);
  }

  private async handleMemberInvited(payload: any) {
    // Notify the invited person
    const authorName = payload.inviterType === UserType.admin ? 'Admin' : payload.inviterName;
    const notification = await this.notificationsService.createNotification({
      userID: payload.inviteeID,
      userType: payload.inviteeType,
      type: 'member_invited',
      title: 'Community invitation 📧',
      message: `${authorName} invited you to join ${payload.communityName}`,
      metadata: {
        communityID: payload.communityID,
        inviteID: payload.inviteID,
        inviterID: payload.inviterID,
        eventType: 'community.member.invited',
        communityName: payload.communityName,
        authorName,
      },
    });

    this.logger.log(`Created notification for member invited: ${notification.id}`);
  }
}
