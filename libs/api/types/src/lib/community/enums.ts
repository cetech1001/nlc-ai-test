export enum CommunityType {
  COACH_CLIENT = 'coach_client',
  COACH_TO_COACH = 'coach_to_coach',
  COURSE = 'course',
  PRIVATE = 'private',
}

export enum CommunityPricingTypes {
  FREE = 'free',
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  ONE_TIME = 'one_time'
}

export enum CommunityVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only',
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  POLL = 'poll',
  EVENT = 'event',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  ANGRY = 'angry',
  SAD = 'sad',
  CELEBRATE = 'celebrate',
}
