"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ResetPasswordHandler", {
    enumerable: true,
    get: function() {
        return ResetPasswordHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _resetpasswordcommand = require("./reset-password.command");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _common = require("@nestjs/common");
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
let ResetPasswordHandler = class ResetPasswordHandler {
    async execute(command) {
        const { token, newPassword } = command.dto;
        const resetRecord = await this.prisma.passwordReset.findUnique({
            where: {
                token
            }
        });
        if (!resetRecord) {
            throw new _common.BadRequestException("Invalid or expired password reset token.");
        }
        if (resetRecord.expiresAt < new Date()) {
            await this.prisma.passwordReset.delete({
                where: {
                    id: resetRecord.id
                }
            });
            throw new _common.BadRequestException("This password reset link has expired. Please request a new one.");
        }
        const hashedPassword = await _argon2.hash(newPassword);
        await this.prisma.$transaction(async (tx)=>{
            await tx.user.update({
                where: {
                    email: resetRecord.email
                },
                data: {
                    password: hashedPassword,
                    hashedRefreshToken: null
                }
            });
            await tx.passwordReset.delete({
                where: {
                    id: resetRecord.id
                }
            });
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ResetPasswordHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_resetpasswordcommand.ResetPasswordCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ResetPasswordHandler);

//# sourceMappingURL=reset-password.handler.js.map