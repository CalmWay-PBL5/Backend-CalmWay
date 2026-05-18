import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ListMySubjectsQuery } from "./list-my-subjects.query";

@QueryHandler(ListMySubjectsQuery)
export class ListMySubjectsHandler implements IQueryHandler<ListMySubjectsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    return await this.prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
