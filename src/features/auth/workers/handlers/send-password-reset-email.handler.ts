import { Injectable, Logger } from "@nestjs/common";
import { MailBuilderService } from "@/shared/mailer/mail-builder.service";
import { MailTransportService } from "@/shared/mailer/mail-transport.service";
import { AppConfigService } from "@/core/config/app-config.service";

export interface SendPasswordResetEmailJobPayload {
  email: string;
  name: string;
  token: string;
}

@Injectable()
export class SendPasswordResetEmailHandler {
  private readonly logger = new Logger(SendPasswordResetEmailHandler.name);

  constructor(
    private readonly mailBuilder: MailBuilderService,
    private readonly mailTransport: MailTransportService,
    private readonly config: AppConfigService,
  ) {}

  async handle(data: SendPasswordResetEmailJobPayload): Promise<void> {
    const { email, name, token } = data;

    try {
      const frontendUrl = this.config.get("FRONTEND_URL");
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

      const htmlContent = await this.mailBuilder.buildTemplate(
        "reset-password",
        {
          name: name || "Thành viên",
          resetUrl,
        },
      );

      await this.mailTransport.send(
        email,
        "Đặt lại mật khẩu Flying Class",
        htmlContent,
      );
      this.logger.log(`Successfully dispatched password reset email to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }
}
