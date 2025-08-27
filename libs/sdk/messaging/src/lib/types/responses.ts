import {MessageType} from "./index";

export interface DirectMessageResponse {
  id: string;
  conversationID: string;
  senderID: string;
  senderType: 'admin' | 'coach' | 'client';
  type: MessageType;
  content: string;
  mediaUrls: string[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  replyToMessageID?: string;
  createdAt: Date;
  replyToMessage?: {
    id: string;
    content: string;
    senderID: string;
    senderType: string;
    createdAt: Date;
  };
}

export interface ConversationResponse {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participantIDs: string[];
  participantTypes: ('admin' | 'coach' | 'client')[];
  lastMessageID?: string;
  lastMessageAt?: Date;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
  messages?: DirectMessageResponse[];
}

export interface UnreadCountResponse {
  unreadCount: number;
}
