"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VerifyEmailHandler", {
    enumerable: true,
    get: function() {
        return VerifyEmailHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _common = require("@nestjs/common");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _verifyemailcommand = require("./verify-email.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let VerifyEmailHandler = class VerifyEmailHandler {
    async execute(command) {
        const { token } = command;
        const verificationRecord = await this.prisma.emailVerification.findUnique({
            where: {
                token
            }
        });
        if (!verificationRecord) {
            throw new _common.BadRequestException("Invalid verification token.");
        }
        if (verificationRecord.expiresAt < new Date()) {
            await this.prisma.emailVerification.delete({
                where: {
                    id: verificationRecord.id
                }
            });
            throw new _common.BadRequestException("Verification token has expired.");
        }
        try {
            await this.prisma.$transaction(async (tx)=>{
                await tx.user.update({
                    where: {
                        email: verificationRecord.email
                    },
                    data: {
                        is_verified: true
                    }
                });
                await tx.emailVerification.delete({
                    where: {
                        id: verificationRecord.id
                    }
                });
            });
            this.logger.log(`User ${verificationRecord.email} successfully verified.`);
        } catch (error) {
            this.logger.error(`Failed to complete verification transaction`, error);
            throw new _common.BadRequestException("Verification process failed. Please try again later.");
        }
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(VerifyEmailHandler.name);
    }
};
VerifyEmailHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_verifyemailcommand.VerifyEmailCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], VerifyEmailHandler);

//# sourceMappingURL=verify-email.handler.js.map