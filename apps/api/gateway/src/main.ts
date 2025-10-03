import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { SecurityService } from './app/security/security.service';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser for streaming
  });

  const configService = app.get(ConfigService);
  const securityService = app.get(SecurityService);

  // Add raw body parser for streaming uploads
  app.use((req: any, res: any, next: any) => {
    const contentType = req.headers['content-type'] || '';

    // Only parse body for non-multipart requests
    if (!contentType.includes('multipart/form-data')) {
      const bodyParser = require('body-parser');
      return bodyParser.json({ limit: '50mb' })(req, res, next);
    }

    next();
  });

  app.use(cookieParser());

  app.useWebSocketAdapter(new IoAdapter(app));

  securityService.applySecurity(app);

  const corsOrigins = configService.get<string[]>('gateway.cors.origins');
  const corsCredentials = configService.get<boolean>(
    'gateway.cors.credentials'
  );

  app.enableCors({
    origin: corsOrigins,
    credentials: corsCredentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-anti-spam-token',
      'x-anti-spam-signature',
      'x-anti-spam-timestamp',
    ],
    maxAge: 86400, // 24 hours
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('NLC AI API Gateway')
    .setDescription('Unified API Gateway for NLC AI Platform')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.nextlevelcoach.ai', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`🚀 API Gateway is running on: http://localhost:${port}/api`);
  Logger.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
  Logger.log(`🔍 Health checks at: http://localhost:${port}/api/health`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start API Gateway:', error);
  process.exit(1);
});
