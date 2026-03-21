import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisHealthIndicator } from './redis.health';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  providers: [RedisService, RedisHealthIndicator],
  exports: [RedisService, RedisHealthIndicator],
})
export class RedisModule {}