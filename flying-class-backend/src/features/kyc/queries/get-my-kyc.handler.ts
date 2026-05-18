import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { S3StorageService } from "@/infrastructure/storage/s3-storage.service";
import { KycStatus } from "@prisma/client";
import { GetMyKycQuery } from "./get-my-kyc.query";

@QueryHandler(GetMyKycQuery)
export class GetMyKycHandler implements IQueryHandler<GetMyKycQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async execute(query: GetMyKycQuery) {
    const application = await this.prisma.kycApplication.findUnique({
      where: { userId: query.userId },
      select: {
        id: true,
        userId: true,
        identityCardUrl: true,
        supportingDocumentUrls: true,
        status: true,
        rejectionReason: true,
        reviewedBy: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!application) {
      return {
        submitted: false,
        status: null,
        canAccessDashboard: false,
        requiresKycSubmission: true,
        isKycPendingReview: false,
        canResubmit: true,
        application: null,
      };
    }

    const identityCardUrl = application.identityCardUrl ?? null;
    const supportingDocumentUrls = this.toUrlList(
      application.supportingDocumentUrls,
    );

    const [secureIdentityCardUrl, secureSupportingDocumentUrls] =
      await Promise.all([
        identityCardUrl
          ? this.storage.getPresignedUrl(identityCardUrl)
          : Promise.resolve(null),
        Promise.all(
          supportingDocumentUrls.map((url) => this.storage.getPresignedUrl(url)),
        ),
      ]);

    return {
      submitted: true,
      status: application.status,
      canAccessDashboard: application.status === KycStatus.APPROVED,
      requiresKycSubmission: application.status === KycStatus.REJECTED,
      isKycPendingReview: application.status === KycStatus.PENDING,
      canResubmit: application.status === KycStatus.REJECTED,
      application: {
        ...application,
        identityCardPublicUrl: identityCardUrl
          ? this.resolvePublicUrl(identityCardUrl)
          : null,
        secureIdentityCardUrl,
        supportingDocumentPublicUrls: supportingDocumentUrls.map((url) =>
          this.resolvePublicUrl(url),
        ),
        secureSupportingDocumentUrls,
      },
    };
  }

  private toUrlList(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === "string");
  }

  private resolvePublicUrl(url: string): string {
    const storageWithPublicUrl = this.storage as S3StorageService & {
      toPublicUrl?: (fullUrl: string) => string;
    };

    if (typeof storageWithPublicUrl.toPublicUrl === "function") {
      return storageWithPublicUrl.toPublicUrl(url);
    }

    return url;
  }
}
