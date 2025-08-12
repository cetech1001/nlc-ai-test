export { Settings } from './lib/components/settings';
export { SettingsProvider, useSettings } from './lib/context/settings.context';

export { SettingsTabs } from './lib/components/settings-tabs';
export { AlertMessages } from './lib/components/alert-messages';
export { ProfileSection } from './lib/components/profile-section';
export { AdminIntegrations } from './lib/components/admin/admin-integrations';
export { SocialIntegrations } from './lib/components/coach/social-integrations';
export { CourseIntegrations } from './lib/components/coach/course-integrations';

export * from './lib/types/settings.types';

export const SOCIAL_PLATFORMS = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: 'from-blue-600 to-blue-700',
    authUrl: '/gateway/auth/facebook',
    scopes: ['pages_read_engagement', 'pages_show_list', 'instagram_basic'],
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: 'from-pink-500 to-purple-600',
    authUrl: '/gateway/auth/instagram',
    scopes: ['instagram_basic', 'instagram_content_publish'],
  },
  youtube: {
    name: 'YouTube',
    icon: '📺',
    color: 'from-red-500 to-red-600',
    authUrl: '/gateway/auth/youtube',
    scopes: ['youtube.readonly', 'youtube.upload'],
  },
  twitter: {
    name: 'X (Twitter)',
    icon: '🐦',
    color: 'from-gray-800 to-black',
    authUrl: '/gateway/auth/twitter',
    scopes: ['tweet.read', 'users.read'],
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: 'from-pink-600 to-black',
    authUrl: '/gateway/auth/tiktok',
    scopes: ['user.info.basic', 'video.list'],
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-700 to-blue-800',
    authUrl: '/gateway/auth/linkedin',
    scopes: ['r_liteprofile', 'r_organization_social'],
  },
} as const;

export const COURSE_PLATFORMS = {
  kajabi: {
    name: 'Kajabi',
    icon: '🎓',
    color: 'from-orange-500 to-red-600',
    fields: [
      { name: 'subdomain', type: 'text', placeholder: 'yoursite', required: true },
      { name: 'apiKey', type: 'password', placeholder: 'Your Kajabi API key', required: true },
    ],
  },
  skool: {
    name: 'Skool',
    icon: '🏫',
    color: 'from-green-500 to-emerald-600',
    fields: [
      { name: 'communityUrl', type: 'url', placeholder: 'https://skool.com/your-community', required: true },
      { name: 'apiKey', type: 'password', placeholder: 'Your Skool API key', required: true },
    ],
  },
  thinkific: {
    name: 'Thinkific',
    icon: '💡',
    color: 'from-blue-500 to-purple-600',
    fields: [
      { name: 'subdomain', type: 'text', placeholder: 'yourschool', required: true },
      { name: 'apiKey', type: 'password', placeholder: 'Your Thinkific API key', required: true },
    ],
  },
  teachable: {
    name: 'Teachable',
    icon: '📚',
    color: 'from-purple-500 to-pink-600',
    fields: [
      { name: 'schoolUrl', type: 'url', placeholder: 'https://yourschool.teachable.com', required: true },
      { name: 'apiKey', type: 'password', placeholder: 'Your Teachable API key', required: true },
    ],
  },
} as const;

export const EMAIL_PROVIDER_TYPES = {
  smtp: 'SMTP',
  mailgun: 'Mailgun',
  sendgrid: 'SendGrid',
  ses: 'Amazon SES',
} as const;
