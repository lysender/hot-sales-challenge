import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { REDIS_URL } from 'src/constants';
import { Nullable } from 'src/shared/nullable';

type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisService implements OnModuleInit {
  private ready = false;
  private client: RedisClient;

  constructor(
    private configService: ConfigService,
    private logger: Logger,
  ) {}

  onModuleInit() {
    // Connect to redis
    this.client = createClient({
      url: this.configService.getOrThrow(REDIS_URL),
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis client error: ${err}`);
    });

    this.client
      .connect()
      .then(() => {
        this.ready = true;
        this.logger.log('Redis client connected');
      })
      .catch((err) => {
        this.logger.error(`Redis client connect error: ${err}`);
      });
  }

  isReady(): boolean {
    return this.ready;
  }

  async setValue(key: string, value: number) {
    if (this.ready) {
      await this.client.set(key, value);
    }
  }

  async getValue(key: string): Promise<Nullable<number>> {
    if (this.ready) {
      const res = await this.client.get(key);
      if (res && res.length > 0) {
        return Number.parseInt(res, 10);
      }
    }
    return null;
  }
}
