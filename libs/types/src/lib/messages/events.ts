import { BaseEvent } from '../base-event';
import { UserType } from '../users';
import { MessageType } from './enums';
import {ConversationType} from "./common";

export interface MessageCreatedEvent extends BaseEvent {
  eventType: 'messages.message.created';
  payload: {
    messageID: string;
    conversationID: string;
    senderID: string;
    conversationType: ConversationType;
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
  eventType: 'messages.conversation.created';
  payload: {
    conversationID: string;
    type: 'direct' | 'group';
    conversationType: ConversationType;
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
  eventType: 'messages.message.read';
  payload: {
    messageIDs: string[];
    conversationID: string;
    readerID: string;
    readerType: UserType;
    readAt: string;
  };
}

export interface MessageUpdatedEvent extends BaseEvent {
  eventType: 'messages.message.updated';
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
  eventType: 'messages.message.deleted';
  payload: {
    messageID: string;
    conversationID: string;
    senderID: string;
    senderType: UserType;
    deletedAt: string;
  };
}

export type MessagesEvent =
  | MessageCreatedEvent
  | ConversationCreatedEvent
  | MessageReadEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent;

export const MESSAGING_ROUTING_KEYS = {
  MESSAGE_CREATED: 'messages.message.created',
  CONVERSATION_CREATED: 'messages.conversation.created',
  MESSAGE_READ: 'messages.message.read',
  MESSAGE_UPDATED: 'messages.message.updated',
  MESSAGE_DELETED: 'messages.message.deleted',
} as const;
