//apps/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 DTO validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 🔹 Swagger config
  const config = new DocumentBuilder()
    .setTitle("Direct Transf'air API")
    .setDescription('Documentation officielle du backend Direct Transf’air')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);

  console.log('🚀 Backend running: http://localhost:3000');
  console.log('📘 Swagger: http://localhost:3000/swagger');
}
bootstrap();
