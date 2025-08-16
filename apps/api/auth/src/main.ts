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

  const swaggerDescription = `
    The **Auth Service** provides endpoints for user authentication and authorization.
    It includes functionality for:

    - User registration and login
    - JWT-based authentication
    - Token refresh and revocation
    - Role- and permission-based access control
    - Password management (reset, update)

    Use these endpoints to securely authenticate users and manage access across the system.
  `;

  const config = new DocumentBuilder()
    .setTitle('NLC AI Auth Service')
    .setDescription(swaggerDescription)
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Authorisation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('api/auth');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Auth Service is running on: http://localhost:${port}/api/auth`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Auth Service:', error);
  process.exit(1);
});
