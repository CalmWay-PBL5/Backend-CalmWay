import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { BadRequestException, NotFoundException, Logger } from "@nestjs/common";
import { PayoutStatus } from "@prisma/client";
import { ReviewPayoutCommand } from "./review-payout.command";

@CommandHandler(ReviewPayoutCommand)
export class ReviewPayoutHandler implements ICommandHandler<ReviewPayoutCommand> {
  private readonly logger = new Logger(ReviewPayoutHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ReviewPayoutCommand) {
    const { payoutId, adminId, dto } = command;

    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!payout) throw new NotFoundException("Không tìm thấy yêu cầu rút tiền.");
    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException("Yêu cầu này đã được xử lý trước đó.");
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.payoutRequest.update({
          where: { id: payoutId },
          data: {
            status: dto.status,
            transactionRef:
              dto.status === PayoutStatus.COMPLETED ? dto.transactionRef : null,
            rejectionReason:
              dto.status === PayoutStatus.REJECTED ? dto.reason : null,
            reviewedBy: adminId,
            reviewedAt: new Date(),
          },
        });

        if (dto.status === PayoutStatus.COMPLETED) {
          await tx.wallet.update({
            where: { userId: payout.instructorId },
            data: {
              lockedBalance: { decrement: payout.amount },
            },
          });
        } else if (dto.status === PayoutStatus.REJECTED) {
          await tx.wallet.update({
            where: { userId: payout.instructorId },
            data: {
              lockedBalance: { decrement: payout.amount },
              balance: { increment: payout.amount },
            },
          });
        }
      });

      this.logger.log(
        `Admin [${adminId}] đã ${dto.status} yêu cầu rút tiền [${payoutId}] trị giá ${payout.amount}`,
      );

      return { message: "Đã xử lý yêu cầu rút tiền thành công." };
    } catch (error) {
      this.logger.error(`Lỗi nghiêm trọng khi xử lý rút tiền ${payoutId}`, error);
      throw new BadRequestException(
        "Xử lý tài chính thất bại. Hệ thống đã Rollback.",
      );
    }
  }
}
