import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule, ConfigModule, LoggerModule],
  providers: [RedisService, ConfigService, Logger],
  exports: [RedisService],
})
export class RedisModule {}
