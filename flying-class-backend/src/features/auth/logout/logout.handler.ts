import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { LogoutCommand } from "./logout.command";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly logger = new Logger(LogoutHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { userId } = command;

    try {
      await this.prisma.user.updateMany({
        where: {
          id: userId,
          hashedRefreshToken: { not: null },
        },
        data: {
          hashedRefreshToken: null,
        },
      });

      this.logger.log(
        `User ${userId} successfully logged out. Refresh token revoked.`,
      );
    } catch (error) {
      this.logger.error(`Failed to logout user ${userId}`, error);
    }
  }
}
