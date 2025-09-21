import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import {IoAdapter} from "@nestjs/platform-socket.io";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api/messages');

  const config = new DocumentBuilder()
    .setTitle('NLC AI Messages Service')
    .setDescription('Direct messaging and Admin Support service')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Messages')
    .addTag('Health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.getHttpAdapter().get('/openapi.json', (req, res) => {
    res.json(document);
  });

  const port = process.env.PORT || 3012;
  await app.listen(port);

  Logger.log(`🚀 Messages Service is running on: http://localhost:${port}/api/messages`);
  Logger.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Messages Service:', error);
  process.exit(1);
});
