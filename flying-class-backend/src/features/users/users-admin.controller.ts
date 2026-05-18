import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ToggleUserStatusDto } from "./toggle-status/toggle-status.api";
import { ToggleUserStatusCommand } from "./toggle-status/toggle-status.command";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersAdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(":id/status")
  async toggleStatus(
    @Param("id") targetUserId: string,
    @Body() dto: ToggleUserStatusDto,
    @Req() req: any,
  ) {
    if (!dto.isActive && !dto.reason) {
      throw new BadRequestException("Vui lòng cung cấp lý do khóa tài khoản.");
    }

    return await this.commandBus.execute(
      new ToggleUserStatusCommand(targetUserId, req.user.id, dto),
    );
  }
}
