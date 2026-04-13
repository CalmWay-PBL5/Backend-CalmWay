import { NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { MoveMyClassToTrashCommand } from "./move-my-class-to-trash.command";

@CommandHandler(MoveMyClassToTrashCommand)
export class MoveMyClassToTrashHandler
  implements ICommandHandler<MoveMyClassToTrashCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: MoveMyClassToTrashCommand) {
    const classItem = await this.prisma.class.findFirst({
      where: {
        id: command.classId,
        teacher_id: command.teacherId,
        status: ClassStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!classItem) {
      throw new NotFoundException("Không tìm thấy lớp học để xóa mềm.");
    }

    await this.prisma.class.update({
      where: { id: command.classId },
      data: {
        status: ClassStatus.PENDING_DELETE,
        deleted_at: new Date(),
      },
    });

    return {
      message: "Đã đưa lớp học vào thùng rác.",
    };
  }
}
