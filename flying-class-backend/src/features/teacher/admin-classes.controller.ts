import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ClassStatus, Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetAdminClassDetailQuery } from "./classes/get-admin-class-detail.query";
import { PauseClassByAdminCommand } from "./classes/pause-class-by-admin.command";
import { ResumeClassByAdminCommand } from "./classes/resume-class-by-admin.command";
import { ListAdminClassesDto } from "./classes/list-admin-classes.api";
import { ListAdminClassesQuery } from "./classes/list-admin-classes.query";

@Controller("admin/classes")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminClassesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async list(@Query() query: ListAdminClassesDto) {
    const status = this.normalizeStatus(query.status);
    const keyword = query.q?.trim();

    return await this.queryBus.execute(
      new ListAdminClassesQuery(
        keyword || undefined,
        status,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(":id")
  async getDetail(@Param("id") classId: string) {
    return await this.queryBus.execute(new GetAdminClassDetailQuery(classId));
  }

  @Patch(":id/pause")
  async pause(@Param("id") classId: string) {
    return await this.commandBus.execute(new PauseClassByAdminCommand(classId));
  }

  @Patch(":id/resume")
  async resume(@Param("id") classId: string) {
    return await this.commandBus.execute(new ResumeClassByAdminCommand(classId));
  }

  private normalizeStatus(rawStatus?: string): ClassStatus | undefined {
    if (!rawStatus) {
      return undefined;
    }

    const normalized = rawStatus.trim().toUpperCase();
    if (!normalized || normalized === "ALL") {
      return undefined;
    }

    if (!(normalized in ClassStatus)) {
      throw new BadRequestException("Giá trị status không hợp lệ.");
    }

    return normalized as ClassStatus;
  }
}
