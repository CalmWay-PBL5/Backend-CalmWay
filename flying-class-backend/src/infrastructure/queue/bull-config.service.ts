import { Injectable } from "@nestjs/common";
import {
  SharedBullConfigurationFactory,
  BullRootModuleOptions,
} from "@nestjs/bullmq";
import { AppConfigService } from "@/core/config/app-config.service";
import { parseRedisConnection } from "@/infrastructure/redis/redis-connection.util";

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private readonly config: AppConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
    const connection = parseRedisConnection(
      this.config.get("REDIS_URL"),
      this.config.get("REDIS_PASSWORD"),
    );

    return {
      connection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    };
  }
}
