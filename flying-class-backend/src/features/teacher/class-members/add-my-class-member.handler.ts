import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassMemberStatus, ClassStatus, Role } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { AddMyClassMemberCommand } from "./add-my-class-member.command";

@CommandHandler(AddMyClassMemberCommand)
export class AddMyClassMemberHandler
  implements ICommandHandler<AddMyClassMemberCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddMyClassMemberCommand) {
    const { teacherId, dto } = command;

    const classItem = await this.prisma.class.findFirst({
      where: {
        id: dto.classId,
        teacher_id: teacherId,
        status: ClassStatus.ACTIVE,
      },
      select: {
        id: true,
        max_students: true,
      },
    });

    if (!classItem) {
      throw new NotFoundException("Lớp học không tồn tại hoặc không thuộc về bạn.");
    }

    const student = await this.prisma.user.findUnique({
      where: {
        id: dto.studentId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!student || student.role !== Role.STUDENT) {
      throw new BadRequestException("Không tìm thấy học sinh hợp lệ.");
    }

    if (!student.isActive) {
      throw new BadRequestException("Học sinh đang bị khóa, không thể thêm vào lớp.");
    }

    const [existingMember, activeStudentCount] = await Promise.all([
      this.prisma.classMember.findUnique({
        where: {
          class_id_student_id: {
            class_id: dto.classId,
            student_id: dto.studentId,
          },
        },
      }),
      this.prisma.classMember.count({
        where: {
          class_id: dto.classId,
          status: ClassMemberStatus.ACTIVE,
        },
      }),
    ]);

    if (existingMember?.status === ClassMemberStatus.ACTIVE) {
      throw new BadRequestException("Học sinh này đã tham gia lớp học này rồi.");
    }

    if (activeStudentCount >= classItem.max_students) {
      throw new BadRequestException(
        "Lớp học đã đạt giới hạn sĩ số tối đa, không thể thêm học viên.",
      );
    }

    const member = existingMember
      ? await this.prisma.classMember.update({
          where: {
            class_id_student_id: {
              class_id: dto.classId,
              student_id: dto.studentId,
            },
          },
          data: {
            status: ClassMemberStatus.ACTIVE,
            joined_at: new Date(),
            dropped_at: null,
          },
          include: {
            student: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    full_name: true,
                    avatar: true,
                    phone: true,
                  },
                },
              },
            },
          },
        })
      : await this.prisma.classMember.create({
          data: {
            class_id: dto.classId,
            student_id: dto.studentId,
            status: ClassMemberStatus.ACTIVE,
          },
          include: {
            student: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    full_name: true,
                    avatar: true,
                    phone: true,
                  },
                },
              },
            },
          },
        });

    return {
      id: member.id,
      classId: member.class_id,
      studentId: member.student_id,
      status: member.status,
      joinedAt: member.joined_at,
      droppedAt: member.dropped_at,
      student: {
        id: member.student.id,
        email: member.student.email,
        fullName: member.student.profile?.full_name || null,
        avatar: member.student.profile?.avatar || null,
        phone: member.student.profile?.phone || null,
      },
    };
  }
}
