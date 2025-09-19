export interface AppConfig {
  publicUrl: string;
  platforms: {
    admin: string;
    coach: string;
    preLaunch: string;
  }
  api: {
    baseURL: string;
    leadsPublicToken?: string;
    timeout: number;
    services: {
      users: string;
      leads: string;
      auth: string;
      email: string;
      billing: string;
      analytics: string;
      aiAgents: string;
      community: string;
      media: string;
      notifications: string;
      messaging: string;
      courses: string;
      agents: string;
      integrations: string;
    };
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    enableLanding: boolean;
    enableAnalytics: boolean;
    enableNotifications: boolean;
    maxUploadSize: number;
  };
  tinyMCE: {
    apiKey: string;
  }
}
