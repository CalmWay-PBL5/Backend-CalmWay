"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MoveMyClassToTrashHandler", {
    enumerable: true,
    get: function() {
        return MoveMyClassToTrashHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _movemyclasstotrashcommand = require("./move-my-class-to-trash.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let MoveMyClassToTrashHandler = class MoveMyClassToTrashHandler {
    async execute(command) {
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: command.classId,
                teacher_id: command.teacherId,
                status: _client.ClassStatus.ACTIVE
            },
            select: {
                id: true
            }
        });
        if (!classItem) {
            throw new _common.NotFoundException("Không tìm thấy lớp học để xóa mềm.");
        }
        await this.prisma.class.update({
            where: {
                id: command.classId
            },
            data: {
                status: _client.ClassStatus.PENDING_DELETE,
                deleted_at: new Date()
            }
        });
        return {
            message: "Đã đưa lớp học vào thùng rác."
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
MoveMyClassToTrashHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_movemyclasstotrashcommand.MoveMyClassToTrashCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], MoveMyClassToTrashHandler);

//# sourceMappingURL=move-my-class-to-trash.handler.js.map