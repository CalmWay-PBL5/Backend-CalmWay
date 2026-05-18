import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { PauseClassByAdminCommand } from "./pause-class-by-admin.command";

@CommandHandler(PauseClassByAdminCommand)
export class PauseClassByAdminHandler
  implements ICommandHandler<PauseClassByAdminCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: PauseClassByAdminCommand) {
    const classItem = await this.prisma.class.findUnique({
      where: { id: command.classId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!classItem) {
      throw new NotFoundException("Không tìm thấy lớp học.");
    }

    if (classItem.status === ClassStatus.PAUSED) {
      throw new BadRequestException("Lớp học đang ở trạng thái tạm dừng.");
    }

    if (classItem.status === ClassStatus.PENDING_DELETE) {
      throw new BadRequestException("Không thể tạm dừng lớp học đang ở thùng rác.");
    }

    await this.prisma.class.update({
      where: { id: classItem.id },
      data: {
        status: ClassStatus.PAUSED,
      },
    });

    return {
      message: "Đã tạm dừng lớp học.",
    };
  }
}
