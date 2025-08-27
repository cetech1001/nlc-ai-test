import {MessageType} from "./index";

export interface CreateConversationRequest {
  type: 'direct' | 'group';
  name?: string;
  participantIDs: string[];
  participantTypes: ('admin' | 'coach' | 'client')[];
}

export interface CreateMessageRequest {
  type?: MessageType;
  content: string;
  mediaUrls?: string[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToMessageID?: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface MessageFilters {
  conversationID?: string;
  type?: MessageType;
  search?: string;
  before?: string; // ISO date string
  after?: string; // ISO date string
  page?: number;
  limit?: number;
}

export interface ConversationFilters {
  search?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface MarkAsReadRequest {
  messageIDs: string[];
}
