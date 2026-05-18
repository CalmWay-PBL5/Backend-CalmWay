import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetMyTeacherRevenueSummaryQuery } from "./revenue/get-my-teacher-revenue-summary.query";
import { GetMyTeacherMonthlyRevenueDto } from "./revenue/get-my-teacher-monthly-revenue.api";
import { GetMyTeacherMonthlyRevenueQuery } from "./revenue/get-my-teacher-monthly-revenue.query";

@Controller("teachers/me/revenue")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LECTURER)
export class TeacherRevenueController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("summary")
  async getSummary(@Req() req: any) {
    return await this.queryBus.execute(
      new GetMyTeacherRevenueSummaryQuery(req.user.id),
    );
  }

  @Get("monthly")
  async getMonthly(@Req() req: any, @Query() query: GetMyTeacherMonthlyRevenueDto) {
    const year = query.year || new Date().getUTCFullYear();

    return await this.queryBus.execute(
      new GetMyTeacherMonthlyRevenueQuery(req.user.id, year),
    );
  }
}
