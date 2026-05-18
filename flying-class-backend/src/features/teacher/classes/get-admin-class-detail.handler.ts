import { NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { mapClassEntity } from "./class.mapper";
import { GetAdminClassDetailQuery } from "./get-admin-class-detail.query";

@QueryHandler(GetAdminClassDetailQuery)
export class GetAdminClassDetailHandler
  implements IQueryHandler<GetAdminClassDetailQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAdminClassDetailQuery) {
    const classItem = await this.prisma.class.findUnique({
      where: { id: query.classId },
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
      throw new NotFoundException("Không tìm thấy lớp học.");
    }

    return mapClassEntity(classItem);
  }
}
