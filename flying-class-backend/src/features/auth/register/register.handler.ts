import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { RegisterCommand } from "./register.command";
import { randomBytes } from "crypto";
import { Role } from "@prisma/client";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, string> {
  private readonly logger = new Logger(RegisterHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("auth-queue") private readonly authQueue: Queue,
  ) {}

  async execute(command: RegisterCommand): Promise<string> {
    const { email, fullName, plainTextPassword, role } = command;
    if (!email || !fullName || !plainTextPassword || !role) {
      throw new BadRequestException("Thiếu thông tin đăng ký bắt buộc.");
    }

    if (role !== Role.STUDENT && role !== Role.LECTURER) {
      throw new BadRequestException("role chỉ được là STUDENT hoặc LECTURER.");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Email này đã được sử dụng.");
    }

    const passwordHash = await argon2.hash(plainTextPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    try {
      const { user, verificationToken } = await this.prisma.$transaction(
        async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              password: passwordHash,
              role,
              profile: {
                create: {
                  full_name: fullName,
                },
              },
            },
            include: {
              profile: true,
            },
          });

          const token = randomBytes(32).toString("hex");
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);

          await tx.emailVerification.create({
            data: {
              email: newUser.email,
              token,
              expiresAt,
            },
          });

          return { user: newUser, verificationToken: token };
        },
      );

      this.logger.log(`User created successfully: ${user.id}`);

      await this.authQueue.add("send-register-email", {
        userId: user.id,
        email: user.email,
        name: user.profile?.full_name,
        token: verificationToken,
      });

      return user.id;
    } catch (error) {
      this.logger.error(`Failed to register user ${email}`, error);

      throw new InternalServerErrorException(
        "Đăng ký thất bại. Vui lòng thử lại sau.",
      );
    }
  }
}
