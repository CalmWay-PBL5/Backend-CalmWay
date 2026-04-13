import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResetPasswordCommand } from "./reset-password.command";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { BadRequestException } from "@nestjs/common";
import * as argon2 from "argon2";

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const { token, newPassword } = command.dto;

    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      throw new BadRequestException("Invalid or expired password reset token.");
    }

    if (resetRecord.expiresAt < new Date()) {
      await this.prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      throw new BadRequestException(
        "This password reset link has expired. Please request a new one.",
      );
    }

    const hashedPassword = await argon2.hash(newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: resetRecord.email },
        data: {
          password: hashedPassword,
          hashedRefreshToken: null,
        },
      });

      await tx.passwordReset.delete({ where: { id: resetRecord.id } });
    });
  }
}
