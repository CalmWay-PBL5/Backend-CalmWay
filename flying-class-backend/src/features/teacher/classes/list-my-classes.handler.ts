import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { mapClassEntity } from "./class.mapper";
import { ListMyClassesQuery } from "./list-my-classes.query";

@QueryHandler(ListMyClassesQuery)
export class ListMyClassesHandler implements IQueryHandler<ListMyClassesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListMyClassesQuery) {
    const classes = await this.prisma.class.findMany({
      where: {
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
      orderBy: {
        created_at: "desc",
      },
    });

    return classes.map((classItem) => mapClassEntity(classItem));
  }
}
