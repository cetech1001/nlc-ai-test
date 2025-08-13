import { registerAs } from '@nestjs/config';

export default registerAs('billing', () => ({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  database: {
    url: process.env.DATABASE_URL,
    schema: 'billing',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchange: 'nlc.domain.events',
  },
  service: {
    name: 'billing-service',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
}));
