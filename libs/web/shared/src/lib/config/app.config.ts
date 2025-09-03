import {AppConfig} from "@nlc-ai/types";


export const appConfig: AppConfig = {
  publicUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:4400',
  platforms: {
    admin: process.env.NEXT_PUBLIC_ADMIN_PLATFORM_URL || 'http://localhost:4200',
    coach: process.env.NEXT_PUBLIC_COACH_PLATFORM_URL || 'http://localhost:4300',
    preLaunch: process.env.NEXT_PUBLIC_PRE_LAUNCH_PLATFORM_URL || 'http://localhost:4400',
  },
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    leadsPublicToken: process.env.LEADS_PUBLIC_TOKEN,
    timeout: 30000,
    services: {
      users: `${process.env.NEXT_PUBLIC_API_URL}/users`,
      leads: `${process.env.NEXT_PUBLIC_API_URL}/leads`,
      auth: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
      email: `${process.env.NEXT_PUBLIC_API_URL}/email`,
      billing: `${process.env.NEXT_PUBLIC_API_URL}/billing`,
      analytics: `${process.env.NEXT_PUBLIC_API_URL}/analytics`,
      aiAgents: `${process.env.NEXT_PUBLIC_API_URL}/ai-agents`,
      community: `${process.env.NEXT_PUBLIC_API_URL}/community`,
      media: `${process.env.NEXT_PUBLIC_API_URL}/media`,
      notifications: `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
      messaging: `${process.env.NEXT_PUBLIC_API_URL}/messages`,
      agents: `${process.env.NEXT_PUBLIC_API_URL}/agents`,
      course: `${process.env.NEXT_PUBLIC_API_URL}/course`,
    },
  },
  auth: {
    tokenKey: 'nlc_auth_token',
    refreshTokenKey: 'nlc_refresh_token',
  },
  app: {
    name: 'NLC Coach Dashboard',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: (process.env.NODE_ENV as any) || 'development',
  },
  features: {
    enableLanding: process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    maxUploadSize: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '10485760'), // 10MB default
  },
};
