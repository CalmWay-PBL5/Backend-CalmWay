import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { VerifyEmailCommand } from "./verify-email.command";

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  private readonly logger = new Logger(VerifyEmailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: VerifyEmailCommand): Promise<void> {
    const { token } = command;

    const verificationRecord = await this.prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      throw new BadRequestException("Invalid verification token.");
    }

    if (verificationRecord.expiresAt < new Date()) {
      await this.prisma.emailVerification.delete({
        where: { id: verificationRecord.id },
      });
      throw new BadRequestException("Verification token has expired.");
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { email: verificationRecord.email },
          data: { is_verified: true },
        });

        await tx.emailVerification.delete({
          where: { id: verificationRecord.id },
        });
      });

      this.logger.log(
        `User ${verificationRecord.email} successfully verified.`,
      );
    } catch (error) {
      this.logger.error(`Failed to complete verification transaction`, error);
      throw new BadRequestException(
        "Verification process failed. Please try again later.",
      );
    }
  }
}
