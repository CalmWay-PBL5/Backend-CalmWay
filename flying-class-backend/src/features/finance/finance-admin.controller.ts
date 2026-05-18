import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Role, TransactionStatus } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ReviewPayoutDto } from "./payouts/review-payout.api";
import { ReviewPayoutCommand } from "./payouts/review-payout.command";
import { GetRevenueDashboardQuery } from "./dashboard/get-revenue-dashboard.query";
import { ListFinanceTransactionsDto } from "./transactions/list-transactions.api";
import { ListFinanceTransactionsQuery } from "./transactions/list-transactions.query";

@Controller("admin/finance")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FinanceAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get("dashboard")
  async getDashboard(
    @Query("startDate") startDateStr?: string,
    @Query("endDate") endDateStr?: string,
  ) {
    const endDate = endDateStr ? this.parseDateOrThrow(endDateStr, "endDate") : new Date();
    const startDate = startDateStr
      ? this.parseDateOrThrow(startDateStr, "startDate")
      : this.getDefaultStartDate(endDate);

    return await this.queryBus.execute(
      new GetRevenueDashboardQuery(startDate, endDate),
    );
  }

  @Get("transactions")
  async listTransactions(@Query() query: ListFinanceTransactionsDto) {
    const startDate = query.startDate
      ? this.parseDateOrThrow(query.startDate, "startDate")
      : undefined;
    const endDate = query.endDate
      ? this.parseDateOrThrow(query.endDate, "endDate", { endOfDay: true })
      : undefined;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException("startDate không được lớn hơn endDate.");
    }

    const status = this.normalizeStatus(query.status);
    const keyword = query.q?.trim();

    return await this.queryBus.execute(
      new ListFinanceTransactionsQuery(
        keyword || undefined,
        status,
        query.page,
        query.limit,
        startDate,
        endDate,
      ),
    );
  }

  @Patch("payouts/:id/review")
  async reviewPayout(
    @Param("id") payoutId: string,
    @Body() dto: ReviewPayoutDto,
    @Req() req: any,
  ) {
    return await this.commandBus.execute(
      new ReviewPayoutCommand(payoutId, req.user.id, dto),
    );
  }

  private getDefaultStartDate(endDate: Date) {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    return startDate;
  }

  private parseDateOrThrow(
    rawDate: string,
    field: "startDate" | "endDate",
    options?: { endOfDay?: boolean },
  ) {
    const trimmed = rawDate.trim();
    let parsedDate: Date;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      parsedDate = new Date(`${trimmed}T00:00:00.000Z`);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split("/");
      parsedDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`,
      );
    } else {
      parsedDate = new Date(trimmed);
    }

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(`Giá trị ${field} không hợp lệ.`);
    }

    if (options?.endOfDay) {
      parsedDate.setUTCHours(23, 59, 59, 999);
    }

    return parsedDate;
  }

  private normalizeStatus(rawStatus?: string): TransactionStatus | undefined {
    if (!rawStatus) {
      return undefined;
    }

    const normalized = rawStatus.trim().toUpperCase();
    if (!normalized || normalized === "ALL") {
      return undefined;
    }

    if (!(normalized in TransactionStatus)) {
      throw new BadRequestException("Giá trị status không hợp lệ.");
    }

    return normalized as TransactionStatus;
  }
}
