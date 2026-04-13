"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ToggleUserStatusHandler", {
    enumerable: true,
    get: function() {
        return ToggleUserStatusHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _togglestatuscommand = require("./toggle-status.command");
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
let ToggleUserStatusHandler = class ToggleUserStatusHandler {
    async execute(command) {
        const { targetUserId, adminId, dto } = command;
        if (targetUserId === adminId) {
            throw new _common.BadRequestException("Bạn không thể tự khóa tài khoản của chính mình!");
        }
        const targetUser = await this.prisma.user.findUnique({
            where: {
                id: targetUserId
            }
        });
        if (!targetUser) {
            throw new _common.NotFoundException("Không tìm thấy người dùng này.");
        }
        const shouldRevokeAccess = dto.isActive === false;
        await this.prisma.user.update({
            where: {
                id: targetUserId
            },
            data: {
                isActive: dto.isActive,
                banReason: dto.isActive ? null : dto.reason,
                hashedRefreshToken: shouldRevokeAccess ? null : undefined
            }
        });
        this.logger.log(`Admin [${adminId}] đã chuyển trạng thái User [${targetUserId}] thành ${dto.isActive ? "ACTIVE" : "BANNED"}`);
        return {
            message: dto.isActive ? "Đã mở khóa tài khoản thành công." : "Đã khóa tài khoản thành công."
        };
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(ToggleUserStatusHandler.name);
    }
};
ToggleUserStatusHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_togglestatuscommand.ToggleUserStatusCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ToggleUserStatusHandler);

//# sourceMappingURL=toggle-status.handler.js.map