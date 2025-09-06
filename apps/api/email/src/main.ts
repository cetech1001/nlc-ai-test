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

  app.setGlobalPrefix('api/email');

  const config = new DocumentBuilder()
    .setTitle('NLC AI Email Service')
    .setDescription('Email services and templates')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Email')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3004;
  await app.listen(port);

  console.log(`🚀 Email Service is running on: http://localhost:${port}/api/email`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Email Service:', error);
  process.exit(1);
});
