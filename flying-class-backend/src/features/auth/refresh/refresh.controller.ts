import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtRefreshAuthGuard } from "../guards/jwt-refresh-auth.guard";
import { RefreshCommand } from "./refresh.command";
import { Request as ExpressRequest } from "express"; // 🚀 Import kiểu Request gốc từ Express

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    sub: string;
    email: string;
    refreshToken: string;
  };
}

@Controller("auth")
export class RefreshController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Request() req: AuthenticatedRequest) {
    return await this.commandBus.execute(
      new RefreshCommand(req.user.sub, req.user.refreshToken),
    );
  }
}
