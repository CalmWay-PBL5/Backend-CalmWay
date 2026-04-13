import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfigService } from "@/core/config/app-config.service";
import { PrismaService } from "@/infrastructure/database/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_SECRET"),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        is_verified: true,
        isActive: true,
        banReason: true,
        role: true,
        kycApplication: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("Tài khoản không tồn tại.");
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        `Tài khoản của bạn đã bị khóa. Lý do: ${user.banReason}`,
      );
    }

    if (!user.is_verified) {
      throw new UnauthorizedException("Vui lòng xác thực email.");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycApplication?.status ?? null,
    };
  }
}
