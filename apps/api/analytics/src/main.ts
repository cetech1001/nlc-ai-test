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

  app.setGlobalPrefix('api/analytics');

  const config = new DocumentBuilder()
    .setTitle('NLC AI Analytics Service')
    .setDescription('Analytics service')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Analytics')
    .addTag('Health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.getHttpAdapter().get('/openapi.json', (req, res) => {
    res.json(document);
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);

  Logger.log(`🚀 Analytics Service is running on: http://localhost:${port}/api/analytics`);
  Logger.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Analytics Service:', error);
  process.exit(1);
});
