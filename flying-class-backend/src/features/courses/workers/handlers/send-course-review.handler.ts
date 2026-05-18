import { Injectable, Logger } from "@nestjs/common";
import { MailBuilderService } from "@/shared/mailer/mail-builder.service";
import { MailTransportService } from "@/shared/mailer/mail-transport.service";

@Injectable()
export class SendCourseReviewEmailHandler {
  private readonly logger = new Logger(SendCourseReviewEmailHandler.name);

  constructor(
    private readonly mailBuilder: MailBuilderService,
    private readonly mailTransport: MailTransportService,
  ) {}

  async handle(data: {
    email: string;
    courseTitle: string;
    status: string;
    reason?: string;
  }) {
    const subject =
      data.status === "APPROVED"
        ? `🎉 Khóa học "${data.courseTitle}" đã được duyệt!`
        : `⚠️ Khóa học "${data.courseTitle}" cần chỉnh sửa`;

    const htmlContent = await this.mailBuilder.buildTemplate("course-review", {
      ...data,
      isApproved: data.status === "APPROVED",
    });

    await this.mailTransport.send(data.email, subject, htmlContent);
    this.logger.log(`Đã gửi email kết quả duyệt khóa học cho: ${data.email}`);
  }
}
