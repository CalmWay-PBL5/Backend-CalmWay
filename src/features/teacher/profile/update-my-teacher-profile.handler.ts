import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { S3StorageService } from "@/infrastructure/storage/s3-storage.service";
import { UpdateMyTeacherProfileCommand } from "./update-my-teacher-profile.command";

@CommandHandler(UpdateMyTeacherProfileCommand)
export class UpdateMyTeacherProfileHandler
  implements ICommandHandler<UpdateMyTeacherProfileCommand>
{
  private readonly logger = new Logger(UpdateMyTeacherProfileHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async execute(command: UpdateMyTeacherProfileCommand) {
    const { teacherId, dto, avatarFile } = command;

    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            full_name: true,
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

    const normalized = {
      fullName: this.toOptionalText(dto.fullName),
      phone: this.toOptionalText(dto.phone),
      bio: this.toOptionalText(dto.bio),
    };

    const avatarUrl = avatarFile
      ? await this.storage.uploadFile(avatarFile, "profiles/avatars")
      : undefined;

    const fullNameForCreate =
      normalized.fullName ||
      teacher.profile?.full_name ||
      this.defaultNameFromEmail(teacher.email);

    const profile = await this.prisma.profile.upsert({
      where: { user_id: teacherId },
      update: {
        full_name: normalized.fullName,
        phone: normalized.phone,
        bio: normalized.bio,
        avatar: avatarUrl,
      },
      create: {
        user_id: teacherId,
        full_name: fullNameForCreate,
        phone: normalized.phone,
        bio: normalized.bio,
        avatar: avatarUrl,
      },
      select: {
        id: true,
        user_id: true,
        full_name: true,
        phone: true,
        avatar: true,
        bio: true,
        identify_card_url: true,
        updated_at: true,
      },
    });

    this.logger.log(`Teacher [${teacherId}] updated own profile.`);

    return {
      id: profile.id,
      userId: profile.user_id,
      fullName: profile.full_name,
      phone: profile.phone,
      avatar: profile.avatar,
      bio: profile.bio,
      identifyCardUrl: profile.identify_card_url,
      updatedAt: profile.updated_at,
    };
  }

  private toOptionalText(value?: string) {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private defaultNameFromEmail(email: string) {
    const fallback = email.split("@")[0]?.trim();
    return fallback || "Lecturer";
  }
}
