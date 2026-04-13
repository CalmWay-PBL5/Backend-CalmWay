import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { PayoutStatus, TransactionStatus } from "@prisma/client";
import { GetRevenueDashboardQuery } from "./get-revenue-dashboard.query";

type DailyRevenueRow = {
  createdAt: Date;
  _sum: {
    amount: number | null;
    platformFee: number | null;
  };
};

@QueryHandler(GetRevenueDashboardQuery)
export class GetRevenueDashboardHandler
  implements IQueryHandler<GetRevenueDashboardQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRevenueDashboardQuery) {
    const { startDate, endDate } = query;

    const dateAndSuccessFilter = {
      status: TransactionStatus.SUCCESS,
      createdAt: { gte: startDate, lte: endDate },
    };

    const [transactionStats, payoutStats, totalWallets] = await Promise.all([
      this.prisma.courseTransaction.aggregate({
        where: dateAndSuccessFilter,
        _sum: {
          amount: true,
          platformFee: true,
          instructorRevenue: true,
        },
        _count: { id: true },
      }),
      this.prisma.payoutRequest.aggregate({
        where: {
          status: PayoutStatus.COMPLETED,
          updatedAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.prisma.wallet.aggregate({
        _sum: { balance: true, lockedBalance: true },
      }),
    ]);

    const chartRawData = await this.prisma.courseTransaction.groupBy({
      by: ["createdAt"],
      where: dateAndSuccessFilter,
      _sum: { amount: true, platformFee: true },
      orderBy: { createdAt: "asc" },
    });

    const chartData = this.aggregateByDay(chartRawData);

    return {
      kpis: {
        totalGrossRevenue: transactionStats._sum.amount || 0,
        netPlatformProfit: transactionStats._sum.platformFee || 0,
        instructorEarnings: transactionStats._sum.instructorRevenue || 0,
        totalOrders: transactionStats._count.id || 0,
        totalPayoutsCompleted: payoutStats._sum.amount || 0,
        platformLiability:
          (totalWallets._sum.balance || 0) + (totalWallets._sum.lockedBalance || 0),
      },
      chartData,
    };
  }

  private aggregateByDay(data: DailyRevenueRow[]) {
    const result: Record<string, { date: string; revenue: number; profit: number }> = {};

    for (const row of data) {
      const dateStr = row.createdAt.toISOString().split("T")[0];

      if (!result[dateStr]) {
        result[dateStr] = { date: dateStr, revenue: 0, profit: 0 };
      }

      result[dateStr].revenue += row._sum.amount || 0;
      result[dateStr].profit += row._sum.platformFee || 0;
    }

    return Object.values(result).sort((a, b) => a.date.localeCompare(b.date));
  }
}
