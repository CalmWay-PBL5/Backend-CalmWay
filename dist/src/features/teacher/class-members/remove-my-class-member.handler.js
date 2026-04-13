"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RemoveMyClassMemberHandler", {
    enumerable: true,
    get: function() {
        return RemoveMyClassMemberHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _removemyclassmembercommand = require("./remove-my-class-member.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RemoveMyClassMemberHandler = class RemoveMyClassMemberHandler {
    async execute(command) {
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: command.classId,
                teacher_id: command.teacherId
            },
            select: {
                id: true
            }
        });
        if (!classItem) {
            throw new _common.NotFoundException("Lớp học không tồn tại hoặc không thuộc về bạn.");
        }
        const member = await this.prisma.classMember.findUnique({
            where: {
                class_id_student_id: {
                    class_id: command.classId,
                    student_id: command.studentId
                }
            }
        });
        if (!member) {
            throw new _common.NotFoundException("Không tìm thấy học sinh này trong lớp học.");
        }
        await this.prisma.classMember.update({
            where: {
                class_id_student_id: {
                    class_id: command.classId,
                    student_id: command.studentId
                }
            },
            data: {
                status: _client.ClassMemberStatus.DROPPED,
                dropped_at: new Date()
            }
        });
        return {
            status: "success",
            message: "Đã cập nhật trạng thái học viên thành Thôi học."
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
RemoveMyClassMemberHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_removemyclassmembercommand.RemoveMyClassMemberCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], RemoveMyClassMemberHandler);

//# sourceMappingURL=remove-my-class-member.handler.js.map