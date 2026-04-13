import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { BullModule } from "@nestjs/bullmq";
import { MailerModule } from "@/shared/mailer/mailer.module";
import { CoursesAdminController } from "./courses-admin.controller";
import { ReviewCourseHandler } from "./moderation/review-course.handler";
import { SendCourseReviewEmailHandler } from "./workers/handlers/send-course-review.handler";
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
  controllers: [CoursesAdminController],
  providers: [ReviewCourseHandler, SendCourseReviewEmailHandler, RolesGuard],
  exports: [SendCourseReviewEmailHandler],
})
export class CoursesModule {}
