"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "JwtStrategy", {
    enumerable: true,
    get: function() {
        return JwtStrategy;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _passportjwt = require("passport-jwt");
const _appconfigservice = require("../../../core/config/app-config.service");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let JwtStrategy = class JwtStrategy extends (0, _passport.PassportStrategy)(_passportjwt.Strategy) {
    async validate(payload) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            },
            select: {
                id: true,
                email: true,
                is_verified: true,
                isActive: true,
                banReason: true,
                role: true,
                kycApplication: {
                    select: {
                        status: true
                    }
                }
            }
        });
        if (!user) {
            throw new _common.UnauthorizedException("Tài khoản không tồn tại.");
        }
        if (!user.isActive) {
            throw new _common.UnauthorizedException(`Tài khoản của bạn đã bị khóa. Lý do: ${user.banReason}`);
        }
        if (!user.is_verified) {
            throw new _common.UnauthorizedException("Vui lòng xác thực email.");
        }
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            kycStatus: user.kycApplication?.status ?? null
        };
    }
    constructor(config, prisma){
        super({
            jwtFromRequest: _passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get("JWT_SECRET")
        }), this.prisma = prisma;
    }
};
JwtStrategy = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], JwtStrategy);

//# sourceMappingURL=jwt.strategy.js.map