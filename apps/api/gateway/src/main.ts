import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { SecurityService } from './app/security/security.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const securityService = app.get(SecurityService);

  // Apply security configurations
  securityService.applySecurity(app);

  // Enable CORS
  const corsOrigins = configService.get<string[]>('gateway.cors.origins');
  const corsCredentials = configService.get<boolean>('gateway.cors.credentials');

  app.enableCors({
    origin: corsOrigins,
    credentials: corsCredentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NLC AI API Gateway')
    .setDescription('Unified API Gateway for NLC AI Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.nextlevelcoach.ai', 'Production')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management and profiles')
    .addTag('Media', 'File upload and media management')
    .addTag('Email', 'Email services and templates')
    .addTag('Billing', 'Subscription and payment management')
    .addTag('Leads', 'Lead capture and management')
    .addTag('Notifications', 'Notification services')
    .addTag('Gateway', 'Gateway health and metrics')
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
