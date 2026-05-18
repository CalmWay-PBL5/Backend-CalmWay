import { NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { RestoreMyClassCommand } from "./restore-my-class.command";
import { mapClassEntity } from "./class.mapper";

@CommandHandler(RestoreMyClassCommand)
export class RestoreMyClassHandler implements ICommandHandler<RestoreMyClassCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RestoreMyClassCommand) {
    const classItem = await this.prisma.class.findFirst({
      where: {
        id: command.classId,
        teacher_id: command.teacherId,
        status: ClassStatus.PENDING_DELETE,
      },
      select: { id: true },
    });

    if (!classItem) {
      throw new NotFoundException("Không tìm thấy lớp học trong thùng rác.");
    }

    const restored = await this.prisma.class.update({
      where: { id: command.classId },
      data: {
        status: ClassStatus.ACTIVE,
        deleted_at: null,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        transactions: {
          select: {
            user_id: true,
            amount: true,
            status: true,
          },
        },
        classMembers: {
          select: {
            student_id: true,
            status: true,
            joined_at: true,
          },
        },
      },
    });

    return mapClassEntity(restored);
  }
}
