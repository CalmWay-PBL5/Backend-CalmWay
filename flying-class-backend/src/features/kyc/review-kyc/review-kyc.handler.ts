import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { KycStatus } from "@prisma/client";
import { BadRequestException, NotFoundException, Logger } from "@nestjs/common";
import { ReviewKycCommand } from "./review-kyc.command";

@CommandHandler(ReviewKycCommand)
export class ReviewKycHandler implements ICommandHandler<ReviewKycCommand> {
  private readonly logger = new Logger(ReviewKycHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("auth-queue") private readonly mailQueue: Queue,
  ) {}

  async execute(command: ReviewKycCommand) {
    const { applicationId, adminId, dto } = command;

    const application = await this.prisma.kycApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) throw new NotFoundException("KYC Application not found.");
    if (application.status !== KycStatus.PENDING) {
      throw new BadRequestException("This application has already been reviewed.");
    }

    try {
      await this.prisma.kycApplication.update({
        where: { id: applicationId },
        data: {
          status: dto.status,
          rejectionReason: dto.rejectionReason,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await this.mailQueue.add("send-kyc-result-email", {
        email: application.user.email,
        status: dto.status,
        reason: dto.rejectionReason,
      });

      this.logger.log(
        `KYC ${dto.status} for User ${application.userId} by Admin ${adminId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to review KYC application ${applicationId}`,
        error,
      );
      throw new BadRequestException("Review process failed.");
    }
  }
}
