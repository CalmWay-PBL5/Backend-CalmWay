import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { mapClassEntity } from "./class.mapper";
import { ListMyTrashClassesQuery } from "./list-my-trash-classes.query";

@QueryHandler(ListMyTrashClassesQuery)
export class ListMyTrashClassesHandler
  implements IQueryHandler<ListMyTrashClassesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListMyTrashClassesQuery) {
    const classes = await this.prisma.class.findMany({
      where: {
        teacher_id: query.teacherId,
        status: ClassStatus.PENDING_DELETE,
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
      orderBy: {
        deleted_at: "desc",
      },
    });

    return classes.map((classItem) => mapClassEntity(classItem));
  }
}
