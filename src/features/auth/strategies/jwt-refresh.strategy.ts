import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfigService } from "@/core/config/app-config.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(private readonly config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get("JWT_REFRESH_SECRET"),
      passReqToCallback: true, // 🚀 We need the raw request to get the raw token
    });
  }

  async validate(req: { headers?: Record<string, string | string[] | undefined> }, payload: any) {
    const rawAuthorization = req.headers?.authorization;
    const authorization = Array.isArray(rawAuthorization)
      ? rawAuthorization[0]
      : rawAuthorization;
    const refreshToken = authorization?.replace(/^Bearer\s+/i, "").trim();

    if (!refreshToken)
      throw new UnauthorizedException("Refresh token malformed");

    return { ...payload, refreshToken };
  }
}
