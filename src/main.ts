import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validatsiya
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  // Barcha manbalarga ruxsat
  app.use(cors({
    origin: (origin, callback) => {
      callback(null, true); // Har qanday originni qabul qiladi
    },
    credentials: true,
  }));

  await app.listen(3000, "0.0.0.0");
}

bootstrap();
