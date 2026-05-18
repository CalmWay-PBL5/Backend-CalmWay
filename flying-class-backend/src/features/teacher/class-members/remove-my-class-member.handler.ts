import { NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassMemberStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { RemoveMyClassMemberCommand } from "./remove-my-class-member.command";

@CommandHandler(RemoveMyClassMemberCommand)
export class RemoveMyClassMemberHandler
  implements ICommandHandler<RemoveMyClassMemberCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveMyClassMemberCommand) {
    const classItem = await this.prisma.class.findFirst({
      where: {
        id: command.classId,
        teacher_id: command.teacherId,
      },
      select: {
        id: true,
      },
    });

    if (!classItem) {
      throw new NotFoundException("Lớp học không tồn tại hoặc không thuộc về bạn.");
    }

    const member = await this.prisma.classMember.findUnique({
      where: {
        class_id_student_id: {
          class_id: command.classId,
          student_id: command.studentId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException("Không tìm thấy học sinh này trong lớp học.");
    }

    await this.prisma.classMember.update({
      where: {
        class_id_student_id: {
          class_id: command.classId,
          student_id: command.studentId,
        },
      },
      data: {
        status: ClassMemberStatus.DROPPED,
        dropped_at: new Date(),
      },
    });

    return {
      status: "success",
      message: "Đã cập nhật trạng thái học viên thành Thôi học.",
    };
  }
}
