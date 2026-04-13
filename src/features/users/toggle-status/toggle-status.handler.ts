import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ToggleUserStatusCommand } from "./toggle-status.command";
import { BadRequestException, NotFoundException, Logger } from "@nestjs/common";

@CommandHandler(ToggleUserStatusCommand)
export class ToggleUserStatusHandler
  implements ICommandHandler<ToggleUserStatusCommand>
{
  private readonly logger = new Logger(ToggleUserStatusHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ToggleUserStatusCommand) {
    const { targetUserId, adminId, dto } = command;

    if (targetUserId === adminId) {
      throw new BadRequestException(
        "Bạn không thể tự khóa tài khoản của chính mình!",
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException("Không tìm thấy người dùng này.");
    }

    const shouldRevokeAccess = dto.isActive === false;

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        isActive: dto.isActive,
        banReason: dto.isActive ? null : dto.reason,
        hashedRefreshToken: shouldRevokeAccess ? null : undefined,
      },
    });

    this.logger.log(
      `Admin [${adminId}] đã chuyển trạng thái User [${targetUserId}] thành ${dto.isActive ? "ACTIVE" : "BANNED"}`,
    );

    return {
      message: dto.isActive
        ? "Đã mở khóa tài khoản thành công."
        : "Đã khóa tài khoản thành công.",
    };
  }
}
