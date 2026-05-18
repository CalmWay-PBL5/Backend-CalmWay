import { NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { mapClassEntity } from "./class.mapper";
import { GetMyClassQuery } from "./get-my-class.query";

@QueryHandler(GetMyClassQuery)
export class GetMyClassHandler implements IQueryHandler<GetMyClassQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyClassQuery) {
    const classItem = await this.prisma.class.findFirst({
      where: {
        id: query.classId,
        teacher_id: query.teacherId,
        status: ClassStatus.ACTIVE,
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

    if (!classItem) {
      throw new NotFoundException("Không tìm thấy lớp học hoặc lớp đã bị xóa.");
    }

    return mapClassEntity(classItem);
  }
}
