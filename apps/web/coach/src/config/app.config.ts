interface AppConfig {
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
    enableAnalytics: boolean;
    enableNotifications: boolean;
    maxUploadSize: number;
  };
}

const config: AppConfig = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    services: {
      users: `${process.env.NEXT_PUBLIC_API_URL}/users`,
      leads: `${process.env.NEXT_PUBLIC_API_URL}/leads`,
      auth: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
      email: `${process.env.NEXT_PUBLIC_API_URL}/email`,
      billing: `${process.env.NEXT_PUBLIC_API_URL}/billing`,
      analytics: `${process.env.NEXT_PUBLIC_API_URL}/analytics`,
      aiAgents: `${process.env.NEXT_PUBLIC_API_URL}/ai-agents`,
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
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    maxUploadSize: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '10485760'), // 10MB default
  },
};

export default config;
