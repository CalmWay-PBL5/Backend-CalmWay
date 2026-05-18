import { NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ListMyClassMembersQuery } from "./list-my-class-members.query";

@QueryHandler(ListMyClassMembersQuery)
export class ListMyClassMembersHandler
  implements IQueryHandler<ListMyClassMembersQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListMyClassMembersQuery) {
    const classItem = await this.prisma.class.findFirst({
      where: {
        id: query.classId,
        teacher_id: query.teacherId,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!classItem) {
      throw new NotFoundException("Lớp học không tồn tại hoặc không thuộc về bạn.");
    }

    const members = await this.prisma.classMember.findMany({
      where: {
        class_id: query.classId,
        ...(query.status ? { status: query.status } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            is_verified: true,
            isActive: true,
            created_at: true,
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
      orderBy: {
        joined_at: "desc",
      },
    });

    const activeCount = members.filter((item) => item.status === "ACTIVE").length;

    return {
      class: {
        id: classItem.id,
        title: classItem.title,
        status: classItem.status,
      },
      total: members.length,
      activeCount,
      droppedCount: members.length - activeCount,
      data: members.map((member) => ({
        id: member.id,
        classId: member.class_id,
        studentId: member.student_id,
        status: member.status,
        joinedAt: member.joined_at,
        droppedAt: member.dropped_at,
        student: {
          id: member.student.id,
          email: member.student.email,
          isVerified: member.student.is_verified,
          isActive: member.student.isActive,
          createdAt: member.student.created_at,
          fullName: member.student.profile?.full_name || null,
          avatar: member.student.profile?.avatar || null,
          phone: member.student.profile?.phone || null,
        },
      })),
    };
  }
}
