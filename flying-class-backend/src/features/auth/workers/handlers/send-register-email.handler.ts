import { Injectable, Logger } from "@nestjs/common";
import { MailBuilderService } from "@/shared/mailer/mail-builder.service";
import { MailTransportService } from "@/shared/mailer/mail-transport.service";
import { AppConfigService } from "@/core/config/app-config.service";

export interface SendRegisterEmailJobPayload {
  userId: string;
  email: string;
  name: string;
  token: string;
}

@Injectable()
export class SendRegisterEmailHandler {
  private readonly logger = new Logger(SendRegisterEmailHandler.name);

  constructor(
    private readonly mailBuilder: MailBuilderService,
    private readonly mailTransport: MailTransportService,
    private readonly config: AppConfigService,
  ) {}

  async handle(data: SendRegisterEmailJobPayload): Promise<void> {
    const { email, name, token } = data;

    try {
      const frontendUrl = this.config.get("FRONTEND_URL");
      const verificationUrl = `${frontendUrl}/auth/verify?token=${token}`;

      const htmlContent = await this.mailBuilder.buildTemplate(
        "email-verification",
        {
          name: name || "Thành viên mới",
          verificationUrl,
        },
      );

      await this.mailTransport.send(
        email,
        "Xác nhận tài khoản Flying Class",
        htmlContent,
      );
      this.logger.log(`Successfully dispatched verification email to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }
}
