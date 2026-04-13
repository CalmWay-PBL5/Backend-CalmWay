import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshCommand } from "./refresh.command";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AppConfigService } from "@/core/config/app-config.service";
import * as argon2 from "argon2";

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async execute(command: RefreshCommand) {
    const { userId, refreshToken } = command;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException("Access Denied");
    }

    const isRefreshTokenValid = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new ForbiddenException("Access Denied");
    }

    const payload = { sub: user.id, email: user.email };
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get("JWT_SECRET"),
        expiresIn: this.config.get("JWT_EXPIRES_IN") as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get("JWT_REFRESH_EXPIRES_IN") as any,
      }),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: await argon2.hash(newRefreshToken) },
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }
}
