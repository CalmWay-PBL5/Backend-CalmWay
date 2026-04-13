"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SendClassMessageHandler", {
    enumerable: true,
    get: function() {
        return SendClassMessageHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _sendclassmessagecommand = require("./send-class-message.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SendClassMessageHandler = class SendClassMessageHandler {
    async execute(command) {
        const content = command.content?.trim();
        if (!content) {
            throw new _common.BadRequestException("Nội dung tin nhắn không được để trống.");
        }
        await this.assertCanAccessClass(command.actorId, command.classId);
        const saved = await this.prisma.chatMessage.create({
            data: {
                class_id: command.classId,
                sender_id: command.actorId,
                content
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                full_name: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });
        return {
            id: saved.id,
            classId: saved.class_id,
            senderId: saved.sender_id,
            content: saved.content,
            createdAt: saved.created_at,
            sender: {
                id: saved.sender.id,
                email: saved.sender.email,
                fullName: saved.sender.profile?.full_name || null,
                avatar: saved.sender.profile?.avatar || null
            }
        };
    }
    async assertCanAccessClass(userId, classId) {
        const classItem = await this.prisma.class.findUnique({
            where: {
                id: classId
            },
            select: {
                id: true,
                teacher_id: true,
                status: true
            }
        });
        if (!classItem || classItem.status !== _client.ClassStatus.ACTIVE) {
            throw new _common.NotFoundException("Không tìm thấy lớp học.");
        }
        if (classItem.teacher_id === userId) {
            return;
        }
        const member = await this.prisma.classMember.findUnique({
            where: {
                class_id_student_id: {
                    class_id: classId,
                    student_id: userId
                }
            },
            select: {
                status: true
            }
        });
        if (member?.status === _client.ClassMemberStatus.ACTIVE) {
            return;
        }
        const fallbackByTransaction = await this.prisma.transaction.findFirst({
            where: {
                class_id: classId,
                user_id: userId,
                status: _client.TransactionStatus.SUCCESS
            },
            select: {
                id: true
            }
        });
        if (fallbackByTransaction) {
            return;
        }
        throw new _common.ForbiddenException("Bạn không có quyền gửi tin nhắn trong lớp học này.");
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
SendClassMessageHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_sendclassmessagecommand.SendClassMessageCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], SendClassMessageHandler);

//# sourceMappingURL=send-class-message.handler.js.map