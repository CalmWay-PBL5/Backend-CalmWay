"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReviewKycHandler", {
    enumerable: true,
    get: function() {
        return ReviewKycHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
const _client = require("@prisma/client");
const _common = require("@nestjs/common");
const _reviewkyccommand = require("./review-kyc.command");
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
let ReviewKycHandler = class ReviewKycHandler {
    async execute(command) {
        const { applicationId, adminId, dto } = command;
        const application = await this.prisma.kycApplication.findUnique({
            where: {
                id: applicationId
            },
            include: {
                user: true
            }
        });
        if (!application) throw new _common.NotFoundException("KYC Application not found.");
        if (application.status !== _client.KycStatus.PENDING) {
            throw new _common.BadRequestException("This application has already been reviewed.");
        }
        try {
            await this.prisma.kycApplication.update({
                where: {
                    id: applicationId
                },
                data: {
                    status: dto.status,
                    rejectionReason: dto.rejectionReason,
                    reviewedBy: adminId,
                    reviewedAt: new Date()
                }
            });
            await this.mailQueue.add("send-kyc-result-email", {
                email: application.user.email,
                status: dto.status,
                reason: dto.rejectionReason
            });
            this.logger.log(`KYC ${dto.status} for User ${application.userId} by Admin ${adminId}`);
        } catch (error) {
            this.logger.error(`Failed to review KYC application ${applicationId}`, error);
            throw new _common.BadRequestException("Review process failed.");
        }
    }
    constructor(prisma, mailQueue){
        this.prisma = prisma;
        this.mailQueue = mailQueue;
        this.logger = new _common.Logger(ReviewKycHandler.name);
    }
};
ReviewKycHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_reviewkyccommand.ReviewKycCommand),
    _ts_param(1, (0, _bullmq.InjectQueue)("auth-queue")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _bullmq1.Queue === "undefined" ? Object : _bullmq1.Queue
    ])
], ReviewKycHandler);

//# sourceMappingURL=review-kyc.handler.js.map