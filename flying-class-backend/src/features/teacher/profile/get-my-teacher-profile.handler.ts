import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetMyTeacherProfileQuery } from "./get-my-teacher-profile.query";

@QueryHandler(GetMyTeacherProfileQuery)
export class GetMyTeacherProfileHandler
  implements IQueryHandler<GetMyTeacherProfileQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyTeacherProfileQuery) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: query.teacherId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        is_verified: true,
        isActive: true,
        banReason: true,
        created_at: true,
        updated_at: true,
        profile: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            avatar: true,
            bio: true,
            identify_card_url: true,
            updated_at: true,
          },
        },
        kycApplication: {
          select: {
            id: true,
            status: true,
            identityCardUrl: true,
            supportingDocumentUrls: true,
            rejectionReason: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException("Không tìm thấy tài khoản giảng viên.");
    }

    if (teacher.role !== Role.LECTURER) {
      throw new ForbiddenException("Tài khoản này không phải giảng viên.");
    }

    const identifyCardUrl =
      teacher.kycApplication?.identityCardUrl ??
      teacher.profile?.identify_card_url ??
      null;

    return {
      id: teacher.id,
      email: teacher.email,
      role: teacher.role,
      status: teacher.status,
      isVerified: teacher.is_verified,
      isActive: teacher.isActive,
      banReason: teacher.banReason,
      createdAt: teacher.created_at,
      updatedAt: teacher.updated_at,
      profile: teacher.profile
        ? {
            id: teacher.profile.id,
            fullName: teacher.profile.full_name,
            phone: teacher.profile.phone,
            avatar: teacher.profile.avatar,
            bio: teacher.profile.bio,
            identifyCardUrl,
            updatedAt: teacher.profile.updated_at,
          }
        : null,
      kyc: teacher.kycApplication
        ? {
            id: teacher.kycApplication.id,
            status: teacher.kycApplication.status,
            identityCardUrl: teacher.kycApplication.identityCardUrl,
            supportingDocumentUrls: this.toUrlList(
              teacher.kycApplication.supportingDocumentUrls,
            ),
            rejectionReason: teacher.kycApplication.rejectionReason,
            createdAt: teacher.kycApplication.createdAt,
            updatedAt: teacher.kycApplication.updatedAt,
          }
        : null,
    };
  }

  private toUrlList(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === "string");
  }
}
