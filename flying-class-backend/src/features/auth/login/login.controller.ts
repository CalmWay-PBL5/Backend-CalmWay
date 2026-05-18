import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CommandBus } from "@nestjs/cqrs";
import { LoginDto } from "./login.api";
import { LoginCommand } from "./login.command";
import { CustomThrottlerGuard } from "@/core/guards/custom-throttler.guard";

@Controller("auth")
export class LoginController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(CustomThrottlerGuard) // 🚀 Đổi sang Custom Guard
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return await this.commandBus.execute(new LoginCommand(dto));
  }
}
