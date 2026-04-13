"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RegisterHandler", {
    enumerable: true,
    get: function() {
        return RegisterHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
const _common = require("@nestjs/common");
const _argon2 = /*#__PURE__*/ _interop_require_wildcard(require("argon2"));
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _registercommand = require("./register.command");
const _crypto = require("crypto");
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
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let RegisterHandler = class RegisterHandler {
    async execute(command) {
        const { email, fullName, plainTextPassword, role } = command;
        if (!email || !fullName || !plainTextPassword || !role) {
            throw new _common.BadRequestException("Thiếu thông tin đăng ký bắt buộc.");
        }
        if (role !== _client.Role.STUDENT && role !== _client.Role.LECTURER) {
            throw new _common.BadRequestException("role chỉ được là STUDENT hoặc LECTURER.");
        }
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (existingUser) {
            throw new _common.ConflictException("Email này đã được sử dụng.");
        }
        const passwordHash = await _argon2.hash(plainTextPassword, {
            type: _argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4
        });
        try {
            const { user, verificationToken } = await this.prisma.$transaction(async (tx)=>{
                const newUser = await tx.user.create({
                    data: {
                        email,
                        password: passwordHash,
                        role,
                        profile: {
                            create: {
                                full_name: fullName
                            }
                        }
                    },
                    include: {
                        profile: true
                    }
                });
                const token = (0, _crypto.randomBytes)(32).toString("hex");
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);
                await tx.emailVerification.create({
                    data: {
                        email: newUser.email,
                        token,
                        expiresAt
                    }
                });
                return {
                    user: newUser,
                    verificationToken: token
                };
            });
            this.logger.log(`User created successfully: ${user.id}`);
            await this.authQueue.add("send-register-email", {
                userId: user.id,
                email: user.email,
                name: user.profile?.full_name,
                token: verificationToken
            });
            return user.id;
        } catch (error) {
            this.logger.error(`Failed to register user ${email}`, error);
            throw new _common.InternalServerErrorException("Đăng ký thất bại. Vui lòng thử lại sau.");
        }
    }
    constructor(prisma, authQueue){
        this.prisma = prisma;
        this.authQueue = authQueue;
        this.logger = new _common.Logger(RegisterHandler.name);
    }
};
RegisterHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_registercommand.RegisterCommand),
    _ts_param(1, (0, _bullmq.InjectQueue)("auth-queue")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _bullmq1.Queue === "undefined" ? Object : _bullmq1.Queue
    ])
], RegisterHandler);

//# sourceMappingURL=register.handler.js.map