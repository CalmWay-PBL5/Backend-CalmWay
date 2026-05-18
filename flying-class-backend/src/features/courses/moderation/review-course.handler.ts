import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { BadRequestException, NotFoundException, Logger } from "@nestjs/common";
import { CourseStatus } from "@prisma/client";
import { ReviewCourseCommand } from "./review-course.command";

@CommandHandler(ReviewCourseCommand)
export class ReviewCourseHandler implements ICommandHandler<ReviewCourseCommand> {
  private readonly logger = new Logger(ReviewCourseHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("auth-queue") private readonly mailQueue: Queue,
  ) {}

  async execute(command: ReviewCourseCommand) {
    const { courseId, adminId, dto } = command;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: { select: { email: true, id: true } } },
    });

    if (!course) {
      throw new NotFoundException("Không tìm thấy khóa học.");
    }

    if (course.status !== CourseStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Không thể duyệt. Khóa học hiện đang ở trạng thái: ${course.status}`,
      );
    }

    try {
      await this.prisma.course.update({
        where: { id: courseId },
        data: {
          status: dto.status,
          rejectionReason:
            dto.status === CourseStatus.REJECTED ? dto.reason : null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      this.mailQueue.add("send-course-review-result", {
        email: course.instructor.email,
        courseTitle: course.title,
        status: dto.status,
        reason: dto.reason,
      });

      this.logger.log(`Admin [${adminId}] đã ${dto.status} khóa học [${courseId}]`);

      return {
        message: `Đã ${dto.status === "APPROVED" ? "duyệt" : "từ chối"} khóa học thành công.`,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi duyệt khóa học ${courseId}`, error);
      throw new BadRequestException(
        "Quá trình kiểm duyệt thất bại, vui lòng thử lại.",
      );
    }
  }
}
