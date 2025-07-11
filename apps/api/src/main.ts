/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {Logger, ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ConfigService} from "@nestjs/config";
import cookieParser from 'cookie-parser';
import {Request, Response, NextFunction, json} from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const globalPrefix = 'api';
  const docsEndpoint = 'docs';

  app.use(cookieParser());
  app.setGlobalPrefix(globalPrefix);

  const corsOrigins = configService.get('CORS_ORIGINS', '').split(',').filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use('/api/payments/webhook', (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST') {
      let data = '';
      req.setEncoding('utf8');
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        req.body = data;
        (req as any).rawBody = Buffer.from(data, 'utf8');
        next();
      });
    } else {
      next();
    }
  });

  app.use(json());

  const config = new DocumentBuilder()
    .setTitle('NLC AI API')
    .setDescription('Next Level Coach AI Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(docsEndpoint, app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const port = configService.get('PORT', '');
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 API Documentation: http://localhost:${port}/${docsEndpoint}`);
}

bootstrap();
