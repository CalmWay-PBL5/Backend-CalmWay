import { Controller, Get, Logger } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from "@nestjs/terminus";
import { DatabaseHealthIndicator } from "./indicators/database.health";
import { RedisHealthIndicator } from "./indicators/redis.health";
import { MinioHealthIndicator } from "./indicators/minio.health";

@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly minioHealth: MinioHealthIndicator,
  ) {}

  @Get("liveness")
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),
      () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024),
    ]);
  }

  @Get("readiness")
  @HealthCheck()
  checkReadiness() {
    this.logger.debug("Running readiness health check");

    return this.health.check([
      () => this.databaseHealth.isHealthy("database"),
      () => this.redisHealth.isHealthy("redis"),
      () => this.minioHealth.isHealthy("minio"),
    ]);
  }
}
