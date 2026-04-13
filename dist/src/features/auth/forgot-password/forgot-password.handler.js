"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ForgotPasswordHandler", {
    enumerable: true,
    get: function() {
        return ForgotPasswordHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _forgotpasswordcommand = require("./forgot-password.command");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
const _crypto = require("crypto");
const _common = require("@nestjs/common");
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
let ForgotPasswordHandler = class ForgotPasswordHandler {
    async execute(command) {
        const { email } = command;
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            this.logger.warn(`Password reset requested for non-existent email: ${email}`);
            return;
        }
        const token = (0, _crypto.randomBytes)(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.passwordReset.upsert({
            where: {
                email
            },
            update: {
                token,
                expiresAt
            },
            create: {
                email,
                token,
                expiresAt
            }
        });
        await this.authQueue.add("send-password-reset-email", {
            email: user.email,
            name: user.email.split("@")[0],
            token
        });
    }
    constructor(prisma, authQueue){
        this.prisma = prisma;
        this.authQueue = authQueue;
        this.logger = new _common.Logger(ForgotPasswordHandler.name);
    }
};
ForgotPasswordHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_forgotpasswordcommand.ForgotPasswordCommand),
    _ts_param(1, (0, _bullmq.InjectQueue)("auth-queue")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _bullmq1.Queue === "undefined" ? Object : _bullmq1.Queue
    ])
], ForgotPasswordHandler);

//# sourceMappingURL=forgot-password.handler.js.map