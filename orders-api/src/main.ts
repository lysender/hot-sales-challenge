require('dotenv').config();

import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

const validLogLevels = ['log', 'error', 'warn', 'debug', 'verbose'];

async function bootstrap() {
  let logLevel = 'log' as LogLevel;
  if (process.env.LOG_LEVEL && validLogLevels.includes(process.env.LOG_LEVEL)) {
    logLevel = process.env.LOG_LEVEL as LogLevel;
  }

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: [logLevel],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();
  app.useLogger(app.get(Logger));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
