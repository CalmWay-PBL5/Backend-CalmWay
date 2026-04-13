"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReviewPayoutHandler", {
    enumerable: true,
    get: function() {
        return ReviewPayoutHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _reviewpayoutcommand = require("./review-payout.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ReviewPayoutHandler = class ReviewPayoutHandler {
    async execute(command) {
        const { payoutId, adminId, dto } = command;
        const payout = await this.prisma.payoutRequest.findUnique({
            where: {
                id: payoutId
            }
        });
        if (!payout) throw new _common.NotFoundException("Không tìm thấy yêu cầu rút tiền.");
        if (payout.status !== _client.PayoutStatus.PENDING) {
            throw new _common.BadRequestException("Yêu cầu này đã được xử lý trước đó.");
        }
        try {
            await this.prisma.$transaction(async (tx)=>{
                await tx.payoutRequest.update({
                    where: {
                        id: payoutId
                    },
                    data: {
                        status: dto.status,
                        transactionRef: dto.status === _client.PayoutStatus.COMPLETED ? dto.transactionRef : null,
                        rejectionReason: dto.status === _client.PayoutStatus.REJECTED ? dto.reason : null,
                        reviewedBy: adminId,
                        reviewedAt: new Date()
                    }
                });
                if (dto.status === _client.PayoutStatus.COMPLETED) {
                    await tx.wallet.update({
                        where: {
                            userId: payout.instructorId
                        },
                        data: {
                            lockedBalance: {
                                decrement: payout.amount
                            }
                        }
                    });
                } else if (dto.status === _client.PayoutStatus.REJECTED) {
                    await tx.wallet.update({
                        where: {
                            userId: payout.instructorId
                        },
                        data: {
                            lockedBalance: {
                                decrement: payout.amount
                            },
                            balance: {
                                increment: payout.amount
                            }
                        }
                    });
                }
            });
            this.logger.log(`Admin [${adminId}] đã ${dto.status} yêu cầu rút tiền [${payoutId}] trị giá ${payout.amount}`);
            return {
                message: "Đã xử lý yêu cầu rút tiền thành công."
            };
        } catch (error) {
            this.logger.error(`Lỗi nghiêm trọng khi xử lý rút tiền ${payoutId}`, error);
            throw new _common.BadRequestException("Xử lý tài chính thất bại. Hệ thống đã Rollback.");
        }
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(ReviewPayoutHandler.name);
    }
};
ReviewPayoutHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_reviewpayoutcommand.ReviewPayoutCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ReviewPayoutHandler);

//# sourceMappingURL=review-payout.handler.js.map