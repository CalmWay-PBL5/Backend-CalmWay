import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(configService: ConfigService) {
    super(configService.getOrThrow<string>('redis.url'));

    this.on('connect', () => this.logger.log('Redis successfully connected'));
    this.on('error', (err) => this.logger.error('Redis connection error', err));
  }

  onModuleDestroy() {
    this.disconnect();
    this.logger.log('Redis connection gracefully closed');
  }
}