import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetKycListQuery } from "./get-kyc-list.query";
import { S3StorageService } from "@/infrastructure/storage/s3-storage.service";

@QueryHandler(GetKycListQuery)
export class GetKycListHandler implements IQueryHandler<GetKycListQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async execute(query: GetKycListQuery) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as any } : {};

    const [data, total] = await Promise.all([
      this.prisma.kycApplication.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { email: true, id: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.kycApplication.count({ where }),
    ]);

    const dataWithSecureUrls = await Promise.all(
      data.map(async (request) => {
        const identityCardUrl = request.identityCardUrl ?? null;
        const supportingDocumentUrls = this.toUrlList(
          request.supportingDocumentUrls,
        );

        const [secureIdentityCardUrl, secureSupportingDocumentUrls] =
          await Promise.all([
            identityCardUrl
              ? this.storage.getPresignedUrl(identityCardUrl)
              : Promise.resolve(null),
            Promise.all(
              supportingDocumentUrls.map((url) =>
                this.storage.getPresignedUrl(url),
              ),
            ),
          ]);

        return {
          ...request,
          documentUrl: identityCardUrl,
          documentType: "IDENTITY_CARD",
          identityCardPublicUrl: identityCardUrl
            ? this.resolvePublicUrl(identityCardUrl)
            : null,
          secureIdentityCardUrl,
          publicDocumentUrl: identityCardUrl
            ? this.resolvePublicUrl(identityCardUrl)
            : null,
          secureImageUrl: secureIdentityCardUrl,
          supportingDocumentPublicUrls: supportingDocumentUrls.map((url) =>
            this.resolvePublicUrl(url),
          ),
          secureSupportingDocumentUrls,
        };
      }),
    );

    return {
      data: dataWithSecureUrls,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
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
