import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { AppConfigService } from "@/core/config/app-config.service";

@Injectable()
export class MailTransportService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailTransportService.name);

  constructor(private readonly config: AppConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get("MAIL_HOST"),
      port: Number(this.config.get("MAIL_PORT")),
      secure: this.config.get("MAIL_SECURE") === "true",
      auth: {
        user: this.config.get("MAIL_USER"),
        pass: this.config.get("MAIL_PASS"),
      },
    });
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    const fromName = "Flying Class";
    const fromEmail = this.config.get("MAIL_FROM");

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });

      this.logger.log(
        `📧 Email delivered successfully. Message ID: ${info.messageId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `❌ SMTP Transport Error: Failed to send to ${to}`,
        error instanceof Error ? error.stack : error,
      );

      throw new InternalServerErrorException("Failed to send email via SMTP.");
    }
  }
}
