import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ResetPasswordDto } from "./reset-password.api";
import { ResetPasswordCommand } from "./reset-password.command";

@Controller("auth")
export class ResetPasswordController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.commandBus.execute(new ResetPasswordCommand(dto));
    return {
      message: "Password has been successfully reset. You can now log in.",
    };
  }
}
