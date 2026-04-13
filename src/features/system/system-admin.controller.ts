import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { UpdateSettingDto } from "./settings/update-setting.api";
import { UpdateSettingCommand } from "./settings/update-setting.command";

@Controller("admin/settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SystemAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getAllSettings() {
    return await this.prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });
  }

  @Patch(":key")
  async updateSetting(
    @Param("key") key: string,
    @Body() dto: UpdateSettingDto,
    @Req() req: any,
  ) {
    return await this.commandBus.execute(
      new UpdateSettingCommand(key, req.user.id, dto),
    );
  }
}
