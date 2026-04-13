import {
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus, ContentType } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { CreateCloudDocCommand } from "./create-cloud-doc.command";

type CloudDocMetadata = {
  displayMode: "EMBED" | "REDIRECT";
  fileType:
    | "GOOGLE_OFFICE"
    | "DRIVE_FILE"
    | "DRIVE_FOLDER"
    | "YOUTUBE"
    | "EXTERNAL";
  originalUrl: string;
};

@CommandHandler(CreateCloudDocCommand)
export class CreateCloudDocHandler implements ICommandHandler<CreateCloudDocCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateCloudDocCommand) {
    const { actorId, dto } = command;
    await this.assertTeacherOwnsClass(actorId, dto.classId);

    const processed = this.processCloudUrl(dto.url);

    const maxOrder = await this.prisma.lesson.aggregate({
      where: { class_id: dto.classId },
      _max: { order_index: true },
    });

    const created = await this.prisma.lesson.create({
      data: {
        class_id: dto.classId,
        title: dto.title.trim(),
        content_type: ContentType.CLOUD_DOC,
        url: processed.embedUrl,
        body_text: JSON.stringify({
          displayMode: processed.displayMode,
          fileType: processed.fileType,
          originalUrl: dto.url,
        } satisfies CloudDocMetadata),
        order_index: (maxOrder._max.order_index ?? -1) + 1,
      },
    });

    return {
      id: created.id,
      classId: created.class_id,
      title: created.title,
      url: created.url,
      contentType: created.content_type,
      orderIndex: created.order_index,
      metadata: this.safeParseMetadata(created.body_text),
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
  }

  private async assertTeacherOwnsClass(teacherId: string, classId: string) {
    const classItem = await this.prisma.class.findFirst({
      where: {
        id: classId,
        teacher_id: teacherId,
        status: ClassStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!classItem) {
      throw new ForbiddenException(
        "Bạn không có quyền tạo tài liệu cho lớp học này.",
      );
    }
  }

  private processCloudUrl(rawUrl: string) {
    let embedUrl = rawUrl;
    let displayMode: "EMBED" | "REDIRECT" = "EMBED";
    let fileType: CloudDocMetadata["fileType"] = "EXTERNAL";

    try {
      if (rawUrl.includes("docs.google.com")) {
        fileType = "GOOGLE_OFFICE";
        embedUrl = rawUrl.replace(/\/(edit|view|present|copy|share).*$/, "/preview");
      } else if (rawUrl.includes("drive.google.com/file/d/")) {
        fileType = "DRIVE_FILE";
        const fileId = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
        if (fileId) {
          embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        }
      } else if (rawUrl.includes("drive.google.com/drive/folders/")) {
        fileType = "DRIVE_FOLDER";
        displayMode = "REDIRECT";
      } else if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
        fileType = "YOUTUBE";
        const videoId = rawUrl.includes("v=")
          ? new URL(rawUrl).searchParams.get("v")
          : rawUrl.split("/").pop();

        if (!videoId) {
          throw new BadRequestException("Không thể nhận diện video YouTube.");
        }

        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      displayMode = "REDIRECT";
    }

    return { embedUrl, displayMode, fileType };
  }

  private safeParseMetadata(raw?: string | null) {
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
