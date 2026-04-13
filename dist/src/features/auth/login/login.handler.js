"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LoginHandler", {
    enumerable: true,
    get: function() {
        return LoginHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _logincommand = require("./login.command");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _common = require("@nestjs/common");
const _argon2 = /*#__PURE__*/ _interop_require_wildcard(require("argon2"));
const _jwt = require("@nestjs/jwt");
const _appconfigservice = require("../../../core/config/app-config.service");
const _client = require("@prisma/client");
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
let LoginHandler = class LoginHandler {
    async execute(command) {
        const { email, password } = command.dto;
        const user = await this.prisma.user.findUnique({
            where: {
                email
            },
            include: {
                kycApplication: {
                    select: {
                        status: true
                    }
                }
            }
        });
        if (!user || !user.password) {
            throw new _common.UnauthorizedException("Invalid credentials");
        }
        const isPasswordValid = await _argon2.verify(user.password, password);
        if (!isPasswordValid) {
            throw new _common.UnauthorizedException("Invalid credentials");
        }
        if (!user.is_verified) {
            throw new _common.UnauthorizedException("Please verify your email before logging in.");
        }
        const payload = {
            sub: user.id,
            email: user.email
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get("JWT_SECRET"),
                expiresIn: this.config.get("JWT_EXPIRES_IN")
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get("JWT_REFRESH_SECRET"),
                expiresIn: this.config.get("JWT_REFRESH_EXPIRES_IN")
            })
        ]);
        const hashedRefreshToken = await _argon2.hash(refreshToken);
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                hashedRefreshToken
            }
        });
        const kycStatus = user.kycApplication?.status ?? null;
        const isLecturer = user.role === _client.Role.LECTURER;
        const canAccessDashboard = !isLecturer || kycStatus === _client.KycStatus.APPROVED;
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                kycStatus,
                canAccessDashboard,
                requiresKycSubmission: isLecturer && (!kycStatus || kycStatus === _client.KycStatus.REJECTED),
                isKycPendingReview: isLecturer && kycStatus === _client.KycStatus.PENDING
            }
        };
    }
    constructor(prisma, jwtService, config){
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
};
LoginHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_logincommand.LoginCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], LoginHandler);

//# sourceMappingURL=login.handler.js.map