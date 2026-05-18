import { Injectable, Logger } from "@nestjs/common";
import { MailBuilderService } from "@/shared/mailer/mail-builder.service";
import { MailTransportService } from "@/shared/mailer/mail-transport.service";

export interface KycResultEmailData {
  email: string;
  status: "APPROVED" | "REJECTED";
  reason?: string;
}

@Injectable()
export class SendKycResultEmailHandler {
  private readonly logger = new Logger(SendKycResultEmailHandler.name);

  constructor(
    private readonly mailBuilder: MailBuilderService,
    private readonly mailTransport: MailTransportService,
  ) {}

  async handle(data: KycResultEmailData): Promise<void> {
    const { email, status, reason } = data;

    const subject =
      status === "APPROVED"
        ? "🚀 Welcome to the Flying Class Instructor Team!"
        : "Update regarding your KYC verification";

    const htmlContent = await this.mailBuilder.buildTemplate("kyc-result", {
      status,
      reason,
      isApproved: status === "APPROVED",
    });

    this.logger.log(`📧 Dispatching KYC result email (${status}) to: ${email}`);

    await this.mailTransport.send(email, subject, htmlContent);
  }
}
