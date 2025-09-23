export enum CommunityType {
  COACH_CLIENT = 'coach_client',
  COACH_TO_COACH = 'coach_to_coach',
  COURSE = 'course',
  PRIVATE = 'private',
}

export enum CommunityPricingType {
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
