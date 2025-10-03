// apps/api/media/src/app/config/media.config.ts

import { registerAs } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MediaConfigSchema } from './media-config.schema';

function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(MediaConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Media configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}

export const mediaConfig = registerAs('media', () => {
  const config = validateConfig(process.env);

  return {
    database: {
      url: config.DATABASE_URL,
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
      environment: config.NODE_ENV,
    },
    provider: {
      type: config.MEDIA_PROVIDER,
      videoType: config.VIDEO_PROVIDER,
      cloudinary: {
        cloudName: config.CLOUDINARY_CLOUD_NAME,
        apiKey: config.CLOUDINARY_API_KEY,
        apiSecret: config.CLOUDINARY_API_SECRET,
      },
      s3: {
        bucketName: config.AWS_S3_BUCKET_NAME,
        region: config.AWS_S3_REGION,
        accessKeyID: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        cloudFrontDomain: config.AWS_CLOUDFRONT_DOMAIN,
      },
    },
    upload: {
      maxFileSize: config.MAX_FILE_SIZE,
      maxVideoSize: config.MAX_VIDEO_SIZE,
      enableTransformations: config.ENABLE_TRANSFORMATIONS,
      defaultFolder: config.DEFAULT_FOLDER,
    },
  };
});
