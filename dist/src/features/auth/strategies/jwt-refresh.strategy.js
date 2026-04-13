"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "JwtRefreshStrategy", {
    enumerable: true,
    get: function() {
        return JwtRefreshStrategy;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _passportjwt = require("passport-jwt");
const _appconfigservice = require("../../../core/config/app-config.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let JwtRefreshStrategy = class JwtRefreshStrategy extends (0, _passport.PassportStrategy)(_passportjwt.Strategy, "jwt-refresh") {
    async validate(req, payload) {
        const rawAuthorization = req.headers?.authorization;
        const authorization = Array.isArray(rawAuthorization) ? rawAuthorization[0] : rawAuthorization;
        const refreshToken = authorization?.replace(/^Bearer\s+/i, "").trim();
        if (!refreshToken) throw new _common.UnauthorizedException("Refresh token malformed");
        return {
            ...payload,
            refreshToken
        };
    }
    constructor(config){
        super({
            jwtFromRequest: _passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get("JWT_REFRESH_SECRET"),
            passReqToCallback: true
        }), this.config = config;
    }
};
JwtRefreshStrategy = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], JwtRefreshStrategy);

//# sourceMappingURL=jwt-refresh.strategy.js.map