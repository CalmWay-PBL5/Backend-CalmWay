import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassStatus, Prisma } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { mapClassEntity } from "./class.mapper";
import { ListAdminClassesQuery } from "./list-admin-classes.query";

@QueryHandler(ListAdminClassesQuery)
export class ListAdminClassesHandler
  implements IQueryHandler<ListAdminClassesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminClassesQuery) {
    if (query.status === ClassStatus.PENDING_DELETE) {
      return {
        items: [],
        pagination: {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const keyword = query.keyword?.trim();
    const where: Prisma.ClassWhereInput = {
      status: query.status ?? { not: ClassStatus.PENDING_DELETE },
      ...(keyword
        ? {
            OR: [
              { id: { contains: keyword, mode: "insensitive" as const } },
              { title: { contains: keyword, mode: "insensitive" as const } },
              { class_code: { contains: keyword, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
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
        skip,
        take: query.limit,
      }),
      this.prisma.class.count({ where }),
    ]);

    return {
      items: items.map((classItem) => mapClassEntity(classItem)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
