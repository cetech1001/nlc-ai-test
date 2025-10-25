export const IntegrationType = {
  SOCIAL: 'social',
  APP: 'app',
} as const;
export type IntegrationType = (typeof IntegrationType)[keyof typeof IntegrationType];

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
