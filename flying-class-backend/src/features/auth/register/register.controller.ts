import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { CommandBus } from "@nestjs/cqrs";
import { Role } from "@prisma/client";
import { RegisterRequestDto, RegisterResponseDto } from "./register.api";
import { RegisterCommand } from "./register.command";

@Controller("auth")
export class RegisterController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() request: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const userId = await this.commandBus.execute(
      new RegisterCommand(
        request.email,
        request.fullName,
        request.password,
        request.role,
      ),
    );

    return {
      id: userId,
      email: request.email,
      fullName: request.fullName,
      role: request.role,
      message:
        request.role === Role.LECTURER
          ? "Đăng ký giảng viên thành công! Vui lòng xác thực email, đăng nhập và gửi hồ sơ KYC trước khi vào dashboard."
          : "Đăng ký học viên thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
    };
  }
}
