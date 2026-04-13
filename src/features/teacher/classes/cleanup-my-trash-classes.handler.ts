import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { CleanupMyTrashClassesCommand } from "./cleanup-my-trash-classes.command";

@CommandHandler(CleanupMyTrashClassesCommand)
export class CleanupMyTrashClassesHandler
  implements ICommandHandler<CleanupMyTrashClassesCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CleanupMyTrashClassesCommand) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletableClasses = await this.prisma.class.findMany({
      where: {
        teacher_id: command.teacherId,
        status: ClassStatus.PENDING_DELETE,
        deleted_at: {
          lte: thirtyDaysAgo,
        },
        lessons: {
          none: {},
        },
        exams: {
          none: {},
        },
        transactions: {
          none: {},
        },
      },
      select: {
        id: true,
      },
    });

    if (!deletableClasses.length) {
      return {
        deletedCount: 0,
        message: "Không có lớp nào đủ điều kiện xóa vĩnh viễn.",
      };
    }

    const deleted = await this.prisma.class.deleteMany({
      where: {
        id: {
          in: deletableClasses.map((item) => item.id),
        },
      },
    });

    return {
      deletedCount: deleted.count,
      message: `Đã xóa vĩnh viễn ${deleted.count} lớp học quá hạn 30 ngày trong thùng rác.`,
    };
  }
}
