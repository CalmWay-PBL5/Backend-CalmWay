import { Injectable } from "@nestjs/common";
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { RedisService } from "@/infrastructure/redis/redis.service";

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redisService.getClient().ping();
      if (result !== "PONG") {
        throw new Error(`Unexpected redis ping response: ${result}`);
      }

      return this.getStatus(key, true, { message: "Redis is up" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Redis ping failed";
      throw new HealthCheckError(
        "Redis Health Check failed",
        this.getStatus(key, false, { message }),
      );
    }
  }
}
