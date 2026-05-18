import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { AppConfigService } from "@/core/config/app-config.service";
import * as Minio from "minio";

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient?: Minio.Client;
  private readonly bucketName?: string;
  private readonly enabled: boolean;

  constructor(private readonly config: AppConfigService) {
    const endpoint = this.config.get("S3_ENDPOINT");
    const accessKey = this.config.get("S3_ACCESS_KEY");
    const secretKey = this.config.get("S3_SECRET_KEY");
    const bucketName = this.config.get("S3_BUCKET_NAME");

    if (!endpoint || !accessKey || !secretKey || !bucketName) {
      this.enabled = false;
      this.logger.warn("MinIO is disabled due to missing S3 configuration.");
      return;
    }

    const parsedEndpoint = this.parseEndpoint(endpoint);

    this.minioClient = new Minio.Client({
      endPoint: parsedEndpoint.endPoint,
      port: parsedEndpoint.port,
      useSSL: parsedEndpoint.useSSL,
      accessKey,
      secretKey,
    });

    this.bucketName = bucketName;
    this.enabled = true;
  }

  async onModuleInit() {
    if (!this.enabled || !this.minioClient || !this.bucketName) {
      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, "us-east-1");
        this.logger.log(`🪣 Created MinIO bucket: ${this.bucketName}`);
      } else {
        this.logger.log(`🪣 MinIO bucket ready: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error("❌ Failed to initialize MinIO bucket", error);
    }
  }

  getClient(): Minio.Client {
    if (!this.minioClient) {
      throw new Error("MinIO is not configured.");
    }
    return this.minioClient;
  }

  getBucketName(): string {
    if (!this.bucketName) {
      throw new Error("MinIO bucket is not configured.");
    }
    return this.bucketName;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private parseEndpoint(endpoint: string) {
    const normalized = endpoint.includes("://") ? endpoint : `http://${endpoint}`;
    const url = new URL(normalized);

    return {
      endPoint: url.hostname,
      port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
      useSSL: url.protocol === "https:",
    };
  }
}
