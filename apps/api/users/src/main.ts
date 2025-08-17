import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('NLC AI Users Service')
    .setDescription('User management, profiles, and relationships service')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3002/api/users', 'Development')
    .addTag('Coaches')
    .addTag('Clients')
    .addTag('Admin')
    .addTag('Relationships')
    .addTag('Profiles')
    .addTag('Analytics')
    .addTag('Health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('api/users');

  const port = process.env.PORT || 3002;
  await app.listen(port);

  Logger.log(`🚀 Users Service is running on: http://localhost:${port}/api/users`);
  Logger.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Users Service:', error);
  process.exit(1);
});
