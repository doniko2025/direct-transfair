//apps/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);
  console.log(`🚀 Backend ready on http://localhost:${port}`);
}

// Obligatoire pour ESLint : catcher les erreurs
bootstrap().catch((err) => {
  console.error('❌ Error starting NestJS backend:', err);
});
