import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetMyTeacherMonthlyRevenueQuery } from "./get-my-teacher-monthly-revenue.query";

@QueryHandler(GetMyTeacherMonthlyRevenueQuery)
export class GetMyTeacherMonthlyRevenueHandler
  implements IQueryHandler<GetMyTeacherMonthlyRevenueQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyTeacherMonthlyRevenueQuery) {
    const startDate = new Date(Date.UTC(query.year, 0, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(query.year + 1, 0, 1, 0, 0, 0));

    const transactions = await this.prisma.courseTransaction.findMany({
      where: {
        status: TransactionStatus.SUCCESS,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        course: {
          instructorId: query.teacherId,
        },
      },
      select: {
        createdAt: true,
        instructorRevenue: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, idx) => ({
      month: idx + 1,
      total: 0,
    }));

    for (const tx of transactions) {
      const monthIndex = tx.createdAt.getUTCMonth();
      monthlyData[monthIndex].total += tx.instructorRevenue;
    }

    return monthlyData;
  }
}
