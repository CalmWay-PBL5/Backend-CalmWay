import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus, ContentType } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { UpdateCloudDocTitleCommand } from "./update-cloud-doc-title.command";

@CommandHandler(UpdateCloudDocTitleCommand)
export class UpdateCloudDocTitleHandler
  implements ICommandHandler<UpdateCloudDocTitleCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateCloudDocTitleCommand) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: command.lessonId },
      select: {
        id: true,
        class_id: true,
        content_type: true,
      },
    });

    if (!lesson || lesson.content_type !== ContentType.CLOUD_DOC) {
      throw new NotFoundException("Tài liệu không tồn tại.");
    }

    const classItem = await this.prisma.class.findFirst({
      where: {
        id: lesson.class_id,
        teacher_id: command.actorId,
        status: ClassStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!classItem) {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa tài liệu này.");
    }

    const updated = await this.prisma.lesson.update({
      where: { id: command.lessonId },
      data: {
        title: command.title.trim(),
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      updatedAt: updated.updated_at,
    };
  }
}
