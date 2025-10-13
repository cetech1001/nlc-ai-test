import {plainToInstance} from "class-transformer";
import {EmailConfigSchema} from "./email-config.schema";
import {validateSync} from "class-validator";
import {registerAs} from "@nestjs/config";

const validateConfig = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EmailConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Email configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}

export const emailConfig = registerAs('email', () => {
  const config = validateConfig(process.env);

  return {
    appName: config.APP_NAME,
    database: {
      url: config.DATABASE_URL,
      schema: config.DATABASE_SCHEMA,
    },
    rabbitmq: {
      url: config.RABBITMQ_URL,
      exchange: config.RABBITMQ_EXCHANGE,
    },
    service: {
      name: config.SERVICE_NAME,
    },
    mailgun: {
      apiKey: config.MAILGUN_API_KEY,
      domain: config.MAILGUN_DOMAIN,
      url: config.MAILGUN_URL,
      fromEmail: config.FROM_EMAIL,
      webhookSigningKey: config.MAILGUN_WEBHOOK_SIGNING_KEY,
    },
    oauth: {
      google: {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
      },
      microsoft: {
        clientID: config.MICROSOFT_CLIENT_ID,
        clientSecret: config.MICROSOFT_CLIENT_SECRET,
      },
    },
    performance: {
      batchSize: config.EMAIL_BATCH_SIZE,
      retentionDays: config.EMAIL_RETENTION_DAYS,
    },
    services: {
      auth: config.AUTH_SERVICE_URL,
    },
    platforms: {
      coach: config.COACH_PLATFORM_URL,
      client: config.CLIENT_PLATFORM_URL,
    },
    redis: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      db: config.REDIS_DB,
    },
  };
});
