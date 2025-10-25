import {ConversationType, UserType} from "@nlc-ai/types";
import {ConversationResponse} from "./responses";

export interface ChatContextConfig {
  userType: UserType;
  canMessageCoaches: boolean;
  canMessageClients: boolean;
  canMessageAdmin: boolean;
  showSupportWidget: boolean;
  conversationFilter?: (conversation: ConversationResponse) => boolean;
}

export interface ConversationMetadata {
  displayName: string;
  displayAvatar: string;
  isOnline: boolean;
  lastMessage: string;
  unreadCount: number;
  contactType: 'admin' | 'client' | 'coach' | 'peer';
  conversationType: ConversationType;
}

export interface OtherParticipant {
  id: string;
  name: string;
  type: UserType;
  avatar: string;
  isOnline: boolean;
}
