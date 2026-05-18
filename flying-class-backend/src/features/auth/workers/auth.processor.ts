import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { SendRegisterEmailHandler } from "./handlers/send-register-email.handler";
import { SendPasswordResetEmailHandler } from "./handlers/send-password-reset-email.handler";
import { SendKycResultEmailHandler } from "@/features/kyc/workers/handlers/send-kyc-result-email.handler";
import { SendCourseReviewEmailHandler } from "@/features/courses/workers/handlers/send-course-review.handler";

@Processor("auth-queue")
export class AuthProcessor extends WorkerHost {
  private readonly logger = new Logger(AuthProcessor.name);

  constructor(
    private readonly registerEmailHandler: SendRegisterEmailHandler,
    private readonly resetEmailHandler: SendPasswordResetEmailHandler,
    private readonly kycResultEmailHandler: SendKycResultEmailHandler,
    private readonly courseReviewEmailHandler: SendCourseReviewEmailHandler,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.debug(`[Auth Queue] Handling job: ${job.name}`);

    switch (job.name) {
      case "send-register-email":
        return await this.registerEmailHandler.handle(job.data);
      case "send-password-reset-email":
        return await this.resetEmailHandler.handle(job.data);
      case "send-kyc-result-email":
        return await this.kycResultEmailHandler.handle(job.data);
      case "send-course-review-result":
        return await this.courseReviewEmailHandler.handle(job.data);

      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
