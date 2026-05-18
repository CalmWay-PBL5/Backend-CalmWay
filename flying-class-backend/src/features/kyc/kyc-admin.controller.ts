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
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { GetKycListQuery } from "./queries/get-kyc-list.query";
import { GetKycStatsQuery } from "./queries/get-kyc-stats.query";
import { ReviewKycCommand } from "./review-kyc/review-kyc.command";
import { ReviewKycDto } from "./review-kyc/review-kyc.api";

@Controller("admin/kyc")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class KycAdminController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getList(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("status") status?: string,
  ) {
    return await this.queryBus.execute(
      new GetKycListQuery(Number(page), Number(limit), status),
    );
  }

  @Get("stats")
  async getDashboardStats(
    @Query("start") start?: string,
    @Query("end") end?: string,
  ) {
    return await this.queryBus.execute(
      new GetKycStatsQuery(
        start ? this.parseDateOrThrow(start, "start") : undefined,
        end ? this.parseDateOrThrow(end, "end") : undefined,
      ),
    );
  }

  @Patch(":id/review")
  async review(@Param("id") id: string, @Body() dto: ReviewKycDto, @Req() req: any) {
    return await this.commandBus.execute(new ReviewKycCommand(id, req.user.id, dto));
  }

  private parseDateOrThrow(rawDate: string, field: "start" | "end") {
    const parsedDate = new Date(rawDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(`Giá trị ${field} không hợp lệ.`);
    }

    return parsedDate;
  }
}
