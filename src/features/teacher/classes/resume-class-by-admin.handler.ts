import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ResumeClassByAdminCommand } from "./resume-class-by-admin.command";

@CommandHandler(ResumeClassByAdminCommand)
export class ResumeClassByAdminHandler
  implements ICommandHandler<ResumeClassByAdminCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ResumeClassByAdminCommand) {
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

    if (classItem.status !== ClassStatus.PAUSED) {
      throw new BadRequestException("Chỉ có thể mở lại lớp học đang tạm dừng.");
    }

    await this.prisma.class.update({
      where: { id: classItem.id },
      data: {
        status: ClassStatus.ACTIVE,
        deleted_at: null,
      },
    });

    return {
      message: "Đã mở lại lớp học.",
    };
  }
}
