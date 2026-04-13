import { Controller, Get, Query, Logger, Redirect } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AppConfigService } from "@/core/config/app-config.service";
import { VerifyEmailQueryDto } from "./verify-email.api";
import { VerifyEmailCommand } from "./verify-email.command";

@Controller("auth")
export class VerifyEmailController {
  private readonly logger = new Logger(VerifyEmailController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly config: AppConfigService,
  ) {}

  @Get("verify")
  @Redirect()
  async verifyEmail(@Query() query: VerifyEmailQueryDto) {
    const frontendUrl = this.config.get("FRONTEND_URL");

    try {
      await this.commandBus.execute(new VerifyEmailCommand(query.token));

      return {
        statusCode: 302,
        url: `${frontendUrl}/login?verified=success`,
      };
    } catch (error) {
      const tokenPreview = query.token ? query.token.substring(0, 8) : "missing";
      this.logger.error(
        `Verification failed for token: ${tokenPreview}...`,
      );

      return {
        statusCode: 302,
        url: `${frontendUrl}/login?verified=error&reason=invalid_or_expired`,
      };
    }
  }
}
