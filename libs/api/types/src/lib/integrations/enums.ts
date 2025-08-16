export enum IntegrationType {
  SOCIAL = 'social',
  APP = 'app',
  COURSE = 'course',
}

export enum AuthType {
  OAUTH = 'oauth',
  API_KEY = 'api_key',
  WEBHOOK = 'webhook',
}

export enum SocialPlatform {
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  TIKTOK = 'tiktok',
}

export enum AppPlatform {
  CALENDLY = 'calendly',
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
}

export enum EmailProviderTypes {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing',
}

export enum SyncFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MANUAL = 'manual',
}
