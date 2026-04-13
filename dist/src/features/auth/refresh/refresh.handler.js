"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RefreshHandler", {
    enumerable: true,
    get: function() {
        return RefreshHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _refreshcommand = require("./refresh.command");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _appconfigservice = require("../../../core/config/app-config.service");
const _argon2 = /*#__PURE__*/ _interop_require_wildcard(require("argon2"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RefreshHandler = class RefreshHandler {
    async execute(command) {
        const { userId, refreshToken } = command;
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user || !user.hashedRefreshToken) {
            throw new _common.ForbiddenException("Access Denied");
        }
        const isRefreshTokenValid = await _argon2.verify(user.hashedRefreshToken, refreshToken);
        if (!isRefreshTokenValid) {
            throw new _common.ForbiddenException("Access Denied");
        }
        const payload = {
            sub: user.id,
            email: user.email
        };
        const [newAccessToken, newRefreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get("JWT_SECRET"),
                expiresIn: this.config.get("JWT_EXPIRES_IN")
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get("JWT_REFRESH_SECRET"),
                expiresIn: this.config.get("JWT_REFRESH_EXPIRES_IN")
            })
        ]);
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                hashedRefreshToken: await _argon2.hash(newRefreshToken)
            }
        });
        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken
        };
    }
    constructor(prisma, jwtService, config){
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
};
RefreshHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_refreshcommand.RefreshCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], RefreshHandler);

//# sourceMappingURL=refresh.handler.js.map