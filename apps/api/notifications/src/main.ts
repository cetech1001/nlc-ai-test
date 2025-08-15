import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('NLC AI Notifications Service')
    .setDescription('Multi-channel notifications orchestration service')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Notifications')
    .addTag('Preferences')
    .addTag('Health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('api/notifications');

  const port = process.env.PORT || 3004;
  await app.listen(port);

  console.log(`🔔 Notifications Service is running on: http://localhost:${port}/api/notifications`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Notifications Service:', error);
  process.exit(1);
});
