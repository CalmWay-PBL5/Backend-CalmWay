import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { PrismaService } from "./database/prisma.service";
import { RedisService } from "./redis/redis.service";
import { MinioService } from "./storage/minio.service";
import { S3StorageService } from "./storage/s3-storage.service";
import { BullConfigService } from "./queue/bull-config.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
  ],
  providers: [
    PrismaService,
    RedisService,
    MinioService,
    S3StorageService,
    BullConfigService,
  ],
  exports: [PrismaService, RedisService, MinioService, S3StorageService, BullModule],
})
export class InfrastructureModule {}
