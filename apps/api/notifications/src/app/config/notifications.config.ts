import { validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { registerAs } from "@nestjs/config";
import { NotificationsConfigSchema } from "./notifications-config.schema";

const validateConfig = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(NotificationsConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Notifications configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
};

export default registerAs('notifications', () => {
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
  };
});
