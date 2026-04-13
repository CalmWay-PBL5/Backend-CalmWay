import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { BullModule } from "@nestjs/bullmq";
import { MailerModule } from "@/shared/mailer/mailer.module";
import { KycController } from "./kyc.controller";
import { KycAdminController } from "./kyc-admin.controller";
import { SubmitKycHandler } from "./submit/submit-kyc.handler";
import { ReviewKycHandler } from "./review-kyc/review-kyc.handler";
import { GetKycListHandler } from "./queries/get-kyc-list.handler";
import { GetKycStatsHandler } from "./queries/get-kyc-stats.handler";
import { GetMyKycHandler } from "./queries/get-my-kyc.handler";
import { S3StorageService } from "@/infrastructure/storage/s3-storage.service";
import { SendKycResultEmailHandler } from "./workers/handlers/send-kyc-result-email.handler";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AppConfigService } from "@/core/config/app-config.service";
import { parseRedisConnection } from "@/infrastructure/redis/redis-connection.util";

@Module({
  imports: [
    CqrsModule,
    MailerModule,
    BullModule.registerQueueAsync({
      name: "auth-queue",
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        return {
          connection: parseRedisConnection(
            config.get("REDIS_URL"),
            config.get("REDIS_PASSWORD"),
          ),
        };
      },
    }),
  ],
  controllers: [KycController, KycAdminController],
  providers: [
    SubmitKycHandler,
    ReviewKycHandler,
    GetKycListHandler,
    GetKycStatsHandler,
    GetMyKycHandler,
    SendKycResultEmailHandler,
    S3StorageService,
    RolesGuard,
  ],
  exports: [SendKycResultEmailHandler],
})
export class KycModule {}
