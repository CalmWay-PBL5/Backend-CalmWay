import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import { AppConfigService } from "@/core/config/app-config.service";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly redisClient: Redis;

  constructor(private readonly config: AppConfigService) {
    this.redisClient = new Redis(this.config.get("REDIS_URL"), {
      password: this.config.get("REDIS_PASSWORD"),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redisClient.on("connect", () => {
      this.logger.log("🟢 Successfully connected to Redis.");
    });

    this.redisClient.on("error", (err) => {
      this.logger.error("❌ Redis connection error:", err.message);
    });
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    this.logger.log("🛑 Disconnected from Redis.");
  }
}
