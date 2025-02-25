import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import path, { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  app.enableCors({
    origin: "*",
    credentials: true,
  });

  // 📌 Fayllarni ko‘rish uchun static middleware
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  await app.listen(3000, "0.0.0.0");
}

bootstrap();
