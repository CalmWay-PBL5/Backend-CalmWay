import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { LogoutCommand } from "./logout.command";
import { Request as ExpressRequest } from "express";

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    email: string;
    is_verified: boolean;
  };
}

@Controller("auth")
export class LogoutController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: AuthenticatedRequest) {
    await this.commandBus.execute(new LogoutCommand(req.user.id));

    return {
      message: "Successfully logged out.",
    };
  }
}
