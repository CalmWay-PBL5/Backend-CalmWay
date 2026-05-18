import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus, ContentType } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { DeleteCloudDocCommand } from "./delete-cloud-doc.command";

@CommandHandler(DeleteCloudDocCommand)
export class DeleteCloudDocHandler implements ICommandHandler<DeleteCloudDocCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteCloudDocCommand) {
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
      throw new ForbiddenException("Bạn không có quyền xóa tài liệu này.");
    }

    await this.prisma.lesson.delete({ where: { id: command.lessonId } });

    return {
      status: "success",
      message: "Đã xóa tài liệu thành công.",
    };
  }
}
