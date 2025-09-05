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

  app.setGlobalPrefix('api/integrations');

  const config = new DocumentBuilder()
    .setTitle('NLC AI Integrations Service')
    .setDescription('OAuth integrations and email accounts management')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('OAuth Integrations')
    .addTag('Email Accounts')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3008;
  await app.listen(port);

  console.log(`🚀 Integrations Service is running on: http://localhost:${port}/api/integrations`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Integrations Service:', error);
  process.exit(1);
});
