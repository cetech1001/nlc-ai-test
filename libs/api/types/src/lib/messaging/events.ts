import { BaseEvent } from '@nlc-ai/api-messaging';
import { UserType } from '../auth';
import { MessageType } from './enums';

export interface MessageCreatedEvent extends BaseEvent {
  eventType: 'messaging.message.created';
  payload: {
    messageID: string;
    conversationID: string;
    senderID: string;
    senderType: UserType;
    senderName: string;
    recipientID: string;
    recipientType: UserType;
    recipientName?: string | null;
    type: MessageType;
    content: string;
    isRead: boolean;
    createdAt: string;
  };
}

export interface ConversationCreatedEvent extends BaseEvent {
  eventType: 'messaging.conversation.created';
  payload: {
    conversationID: string;
    type: 'direct' | 'group';
    name?: string | null;
    participantIDs: string[];
    participantTypes: UserType[];
    creatorID: string;
    creatorType: UserType;
    creatorName: string;
    createdAt: string;
  };
}

export interface MessageReadEvent extends BaseEvent {
  eventType: 'messaging.message.read';
  payload: {
    messageIDs: string[];
    conversationID: string;
    readerID: string;
    readerType: UserType;
    readAt: string;
  };
}

export interface MessageUpdatedEvent extends BaseEvent {
  eventType: 'messaging.message.updated';
  payload: {
    messageID: string;
    conversationID: string;
    senderID: string;
    senderType: UserType;
    newContent: string;
    editedAt: string;
  };
}

export interface MessageDeletedEvent extends BaseEvent {
  eventType: 'messaging.message.deleted';
  payload: {
    messageID: string;
    conversationID: string;
    senderID: string;
    senderType: UserType;
    deletedAt: string;
  };
}

export type MessagingEvent =
  | MessageCreatedEvent
  | ConversationCreatedEvent
  | MessageReadEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent;

export const MESSAGING_ROUTING_KEYS = {
  MESSAGE_CREATED: 'messaging.message.created',
  CONVERSATION_CREATED: 'messaging.conversation.created',
  MESSAGE_READ: 'messaging.message.read',
  MESSAGE_UPDATED: 'messaging.message.updated',
  MESSAGE_DELETED: 'messaging.message.deleted',
} as const;
