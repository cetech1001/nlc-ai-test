import { registerAs } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CommunityConfigSchema } from './community-config.schema';

const validateConfig = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(CommunityConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Community configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}

export default registerAs('community', () => {
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
    jwt: {
      secret: config.JWT_SECRET,
      expiresIn: config.JWT_EXPIRES_IN,
    },
    service: {
      name: config.SERVICE_NAME,
      version: config.SERVICE_VERSION,
      environment: config.NODE_ENV,
    },
    features: {
      maxPostLength: config.MAX_POST_LENGTH,
      maxMessageLength: config.MAX_MESSAGE_LENGTH,
      maxCommunityMembers: config.MAX_COMMUNITY_MEMBERS,
      enableCoachToCommunity: config.ENABLE_COACH_TO_COACH_COMMUNITY,
      enableMediaAttachments: config.ENABLE_MEDIA_ATTACHMENTS,
    },
    retention: {
      messageDays: config.MESSAGE_RETENTION_DAYS,
      postDays: config.POST_RETENTION_DAYS,
    },
  };
});
