export interface AppConfig {
  publicUrl: string;
  api: {
    baseURL: string;
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
}
