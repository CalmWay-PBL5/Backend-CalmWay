import { Injectable } from "@nestjs/common";
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { MinioService } from "@/infrastructure/storage/minio.service";

@Injectable()
export class MinioHealthIndicator extends HealthIndicator {
  constructor(private readonly minioService: MinioService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.minioService.isEnabled()) {
        return this.getStatus(key, true, { message: "MinIO is disabled" });
      }

      const bucketName = this.minioService.getBucketName();
      const exists = await this.minioService.getClient().bucketExists(bucketName);
      if (!exists) {
        throw new Error(`Bucket "${bucketName}" does not exist`);
      }

      return this.getStatus(key, true, { message: "MinIO is up and responding" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "MinIO check failed";
      throw new HealthCheckError(
        "MinIO Health Check failed",
        this.getStatus(key, false, { message }),
      );
    }
  }
}
