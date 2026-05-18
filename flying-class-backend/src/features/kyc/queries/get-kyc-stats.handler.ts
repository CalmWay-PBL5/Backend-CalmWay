import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetKycStatsQuery } from "./get-kyc-stats.query";
import { KycStatus } from "@prisma/client";

@QueryHandler(GetKycStatsQuery)
export class GetKycStatsHandler implements IQueryHandler<GetKycStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetKycStatsQuery) {
    const { startDate, endDate } = query;

    const dateFilter =
      startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {};

    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.kycApplication.count({ where: dateFilter }),
      this.prisma.kycApplication.count({
        where: { ...dateFilter, status: KycStatus.PENDING },
      }),
      this.prisma.kycApplication.count({
        where: { ...dateFilter, status: KycStatus.APPROVED },
      }),
      this.prisma.kycApplication.count({
        where: { ...dateFilter, status: KycStatus.REJECTED },
      }),
    ]);

    return {
      summary: {
        total,
        pending,
        approved,
        rejected,
        approvalRate: total > 0 ? (approved / total) * 100 : 0,
      },
      chartData: {
        labels: ["Đang chờ", "Đã duyệt", "Từ chối"],
        datasets: [pending, approved, rejected],
      },
    };
  }
}
