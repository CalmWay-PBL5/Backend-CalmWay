import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { S3StorageService } from "@/infrastructure/storage/s3-storage.service";
import { BadRequestException } from "@nestjs/common";
import { KycStatus } from "@prisma/client";

export class SubmitKycCommand {
  constructor(
    public readonly userId: string,
    public readonly identityCardFile: Express.Multer.File,
    public readonly supportingDocumentFiles: Express.Multer.File[],
  ) {}
}

@CommandHandler(SubmitKycCommand)
export class SubmitKycHandler implements ICommandHandler<SubmitKycCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async execute(command: SubmitKycCommand) {
    const { userId, identityCardFile, supportingDocumentFiles } = command;
    const submittedAt = new Date();

    if (!identityCardFile) {
      throw new BadRequestException("Thiếu ảnh CCCD/CMND.");
    }

    if (!supportingDocumentFiles?.length) {
      throw new BadRequestException(
        "Cần tải lên ít nhất 1 ảnh chứng chỉ hoặc giấy tờ chứng nhận.",
      );
    }

    const existing = await this.prisma.kycApplication.findUnique({
      where: { userId },
    });
    if (existing && existing.status === KycStatus.PENDING) {
      throw new BadRequestException("You already have a pending application.");
    }

    const [identityCardUrl, supportingDocumentUrls] = await Promise.all([
      this.storage.uploadFile(identityCardFile, "kyc/identity-cards"),
      Promise.all(
        supportingDocumentFiles.map((file) =>
          this.storage.uploadFile(file, "kyc/supporting-documents"),
        ),
      ),
    ]);

    return await this.prisma.kycApplication.upsert({
      where: { userId },
      update: {
        // Khi nộp lại hồ sơ, ghi nhận lại mốc thời gian nộp mới.
        createdAt: submittedAt,
        identityCardUrl,
        supportingDocumentUrls,
        status: KycStatus.PENDING,
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      },
      create: {
        userId,
        createdAt: submittedAt,
        identityCardUrl,
        supportingDocumentUrls,
      },
    });
  }
}
