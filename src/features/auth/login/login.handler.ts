import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginCommand } from "./login.command";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { AppConfigService } from "@/core/config/app-config.service";
import { KycStatus, Role } from "@prisma/client";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async execute(command: LoginCommand) {
    const { email, password } = command.dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        kycApplication: {
          select: { status: true },
        },
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.is_verified) {
      throw new UnauthorizedException(
        "Please verify your email before logging in.",
      );
    }

    const payload = { sub: user.id, email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get("JWT_SECRET"),
        expiresIn: this.config.get("JWT_EXPIRES_IN") as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get("JWT_REFRESH_EXPIRES_IN") as any,
      }),
    ]);

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    const kycStatus = user.kycApplication?.status ?? null;
    const isLecturer = user.role === Role.LECTURER;
    const canAccessDashboard =
      !isLecturer || kycStatus === KycStatus.APPROVED;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        kycStatus,
        canAccessDashboard,
        requiresKycSubmission:
          isLecturer && (!kycStatus || kycStatus === KycStatus.REJECTED),
        isKycPendingReview: isLecturer && kycStatus === KycStatus.PENDING,
      },
    };
  }
}
