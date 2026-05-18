import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForgotPasswordCommand } from "./forgot-password.command";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { randomBytes } from "crypto";
import { Logger } from "@nestjs/common";

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("auth-queue") private readonly authQueue: Queue,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const { email } = command;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`,
      );
      return;
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordReset.upsert({
      where: { email },
      update: { token, expiresAt },
      create: { email, token, expiresAt },
    });

    await this.authQueue.add("send-password-reset-email", {
      email: user.email,
      name: user.email.split("@")[0],
      token,
    });
  }
}
