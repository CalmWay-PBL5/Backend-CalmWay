"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DeleteClassMessageHandler", {
    enumerable: true,
    get: function() {
        return DeleteClassMessageHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _deleteclassmessagecommand = require("./delete-class-message.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DeleteClassMessageHandler = class DeleteClassMessageHandler {
    async execute(command) {
        const message = await this.prisma.chatMessage.findUnique({
            where: {
                id: command.messageId
            },
            select: {
                id: true,
                class_id: true,
                sender_id: true
            }
        });
        if (!message || message.class_id !== command.classId) {
            throw new _common.NotFoundException("Tin nhắn không tồn tại.");
        }
        if (message.sender_id !== command.actorId) {
            throw new _common.ForbiddenException("Bạn không có quyền xóa tin nhắn này.");
        }
        await this.prisma.chatMessage.delete({
            where: {
                id: command.messageId
            }
        });
        return {
            status: "success",
            message: "Đã xóa tin nhắn."
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
DeleteClassMessageHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_deleteclassmessagecommand.DeleteClassMessageCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DeleteClassMessageHandler);

//# sourceMappingURL=delete-class-message.handler.js.map