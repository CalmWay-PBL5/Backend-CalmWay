import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { CommandBus } from "@nestjs/cqrs";
import { ForgotPasswordDto } from "./forgot-password.api";
import { ForgotPasswordCommand } from "./forgot-password.command";

@Controller("auth")
export class ForgotPasswordController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.commandBus.execute(new ForgotPasswordCommand(dto.email));

    return {
      message:
        "If an account with that email exists, we have sent a password reset link.",
    };
  }
}
