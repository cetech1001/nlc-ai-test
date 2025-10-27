import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { UserType } from '@nlc-ai/api-types';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class MessagesHandler implements OnApplicationBootstrap {
  private readonly logger = new Logger(MessagesHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onApplicationBootstrap() {
    await this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    try {
      await this.eventBus.subscribe(
        'notifications-service.messages-events',
        [
          'messages.message.created',
          'messages.conversation.created',
          'messages.message.read',
          // Add more messages events as they're implemented
        ],
        this.handleMessagingEvent.bind(this)
      );

      this.logger.log('✅ Subscribed to messages events');
    } catch (error) {
      this.logger.error('❌ Failed to subscribe to messages events:', error);
    }
  }

  private async handleMessagingEvent(event: any) {
    try {
      const { eventType, payload } = event;

      this.logger.log(`💬 Received messages event: ${eventType}`);

      switch (eventType) {
        case 'messages.message.created':
          await this.handleMessageCreated(payload);
          break;
        case 'messages.conversation.created':
          await this.handleConversationCreated(payload);
          break;
        case 'messages.message.read':
          await this.handleMessageRead(payload);
          break;
        default:
          this.logger.warn(`Unknown messages event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle messages event: ${event.eventType}`, error);
    }
  }

  private async handleMessageCreated(payload: any) {
    // Notify conversation participants about new message (except sender)
    if (payload.recipientID && payload.senderID !== payload.recipientID) {
      const notification = await this.notificationsService.createNotification({
        userID: payload.recipientID,
        userType: payload.recipientType || UserType.coach,
        type: 'message_received',
        title: 'New message 📨',
        message: `${payload.senderName || 'Someone'} sent you a message`,
        actionUrl: `/messages?conversationID=${payload.conversationID}`,
        metadata: {
          conversationID: payload.conversationID,
          messageID: payload.messageID,
          senderID: payload.senderID,
          eventType: 'messages.message.created',
        },
      });

      this.logger.log(`Created notification for message received: ${notification.id}`);
    }
  }

  private async handleConversationCreated(payload: any) {
    // Notify participants about new conversation (except creator)
    if (payload.participantIDs && Array.isArray(payload.participantIDs)) {
      for (const participantID of payload.participantIDs) {
        if (participantID !== payload.creatorID) {
          const notification = await this.notificationsService.createNotification({
            userID: participantID,
            userType: payload.participantType || UserType.coach,
            type: 'conversation_created',
            title: 'New conversation started 💬',
            message: `${payload.creatorName || 'Someone'} started a conversation with you`,
            actionUrl: `/messages/${payload.conversationID}`,
            metadata: {
              conversationID: payload.conversationID,
              creatorID: payload.creatorID,
              eventType: 'messages.conversation.created',
            },
          });

          this.logger.log(`Created notification for conversation created: ${notification.id}`);
        }
      }
    }
  }

  private async handleMessageRead(payload: any) {
    // Optionally notify sender that their message was read
    // This is usually handled in real-time via WebSocket, but we can also create a notification
    // For now, we'll just log it since read receipts are typically real-time only
    this.logger.log(`Message read: ${payload.messageID} by ${payload.readerID}`);
  }
}
