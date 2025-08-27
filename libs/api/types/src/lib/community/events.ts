import { BaseEvent } from '@nlc-ai/api-messaging';
import {UserType} from "../auth";
import {CommunityType, MemberRole, MessageType, PostType, ReactionType} from "./enums";
import {CommunityPricing} from "./requests";

export interface CommunityCreatedEvent extends BaseEvent {
  eventType: 'community.created';
  payload: {
    communityID: string;
    name: string;
    type: CommunityType;
    isSystemCreated: boolean;
    ownerID: string;
    ownerType: UserType;
    pricing: CommunityPricing;
    coachID?: string | null;
    courseID?: string | null;
    createdAt: string;
  };
}

export interface CommunityMemberJoinedEvent extends BaseEvent {
  eventType: 'community.member.joined';
  payload: {
    communityID: string;
    communityName: string;
    memberID: string;
    userID: string;
    userType: UserType;
    role: MemberRole;
    invitedBy?: string;
    joinedAt: string;
  };
}

export interface PostCreatedEvent extends BaseEvent {
  eventType: 'community.post.created';
  payload: {
    postID: string;
    communityID: string;
    communityName: string;
    authorID: string;
    authorType: UserType;
    authorName: string;
    type: PostType;
    content: string;
    createdAt: string;
  };
}

export interface PostLikedEvent extends BaseEvent {
  eventType: 'community.post.liked';
  payload: {
    postID: string;
    communityID: string;
    communityName: string;
    postAuthorID: string;
    postAuthorType: UserType;
    likedByID: string;
    likedByType: UserType;
    likedByName: string;
    reactionType: ReactionType;
    likedAt: string;
  };
}

export interface PostCommentedEvent extends BaseEvent {
  eventType: 'community.post.commented';
  payload: {
    commentID: string;
    postID: string;
    communityID: string;
    communityName: string;
    postAuthorID: string;
    postAuthorType: UserType;
    commentAuthorID: string;
    commentAuthorType: UserType;
    commentAuthorName: string;
    content: string;
    commentedAt: string;
  };
}

export interface DirectMessageSentEvent extends BaseEvent {
  eventType: 'community.message.sent';
  payload: {
    messageID: string;
    conversationID: string;
    senderID: string;
    senderType: UserType;
    senderName: string;
    recipientID: string;
    recipientType: UserType;
    type: MessageType;
    content: string;
    sentAt: string;
  };
}

export interface CommunityMemberInvitedEvent extends BaseEvent {
  eventType: 'community.member.invited';
  payload: {
    communityID: string;
    communityName: string;
    inviteID: string;
    inviteeID: string;
    inviteeType: UserType;
    inviteeName: string;
    inviterID: string;
    inviterType: UserType;
    inviterName: string;
    invitedAt: string;
  };
}

export type CommunityEvent =
  | CommunityCreatedEvent
  | CommunityMemberJoinedEvent
  | PostCreatedEvent
  | PostLikedEvent
  | PostCommentedEvent
  | DirectMessageSentEvent
  | CommunityMemberInvitedEvent;

// Constants for routing keys
export const COMMUNITY_ROUTING_KEYS = {
  CREATED: 'community.created',
  MEMBER_JOINED: 'community.member.joined',
  MEMBER_INVITED: 'community.member.invited',
  POST_CREATED: 'community.post.created',
  POST_LIKED: 'community.post.liked',
  POST_COMMENTED: 'community.post.commented',
  MESSAGE_SENT: 'community.message.sent',
} as const;
