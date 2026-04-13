import { Injectable } from "@nestjs/common";
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { PrismaService } from "@/infrastructure/database/prisma.service";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true, { message: "Database is up" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database check failed";
      throw new HealthCheckError(
        "Database Health Check failed",
        this.getStatus(key, false, { message }),
      );
    }
  }
}
