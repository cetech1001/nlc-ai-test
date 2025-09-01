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

export default registerAs('email', () => {
  const config = validateConfig(process.env);

  return {
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
    }
  };
});
