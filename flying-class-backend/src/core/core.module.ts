import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/app-config.module";
import { AppConfigService } from "./config/app-config.service";
import { CqrsModule } from "@nestjs/cqrs";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { HealthModule } from "./health/health.module";
import { RedisService } from "@/infrastructure/redis/redis.service";

@Module({
  imports: [
    CqrsModule,
    AppConfigModule,
    HealthModule,
    ThrottlerModule.forRootAsync({
      // 🚀 BUG FIX: Tiêm RedisService vào để xài chung kết nối ổn định
      inject: [AppConfigService, RedisService],
      useFactory: (config: AppConfigService, redisService: RedisService) => ({
        throttlers: [
          { name: "default", ttl: 60000, limit: 100 },
          { name: "auth", ttl: 60000, limit: 5 },
        ],
        // Thay vì tạo kết nối mới dễ bị treo, lấy client từ RedisService
        storage: new ThrottlerStorageRedisService(redisService.getClient()),
      }),
    }),
  ],
  exports: [CqrsModule, AppConfigModule, ThrottlerModule],
})
export class CoreModule {}
