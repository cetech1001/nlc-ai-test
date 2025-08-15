import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, AllExceptionsFilter, HttpExceptionFilter } from '@nlc-ai/api-validation';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Integrations Service API')
    .setDescription('OAuth integrations and email account management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`Integrations service running on port ${port}`);
}

bootstrap();
