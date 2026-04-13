"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CleanupMyTrashClassesHandler", {
    enumerable: true,
    get: function() {
        return CleanupMyTrashClassesHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _cleanupmytrashclassescommand = require("./cleanup-my-trash-classes.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CleanupMyTrashClassesHandler = class CleanupMyTrashClassesHandler {
    async execute(command) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const deletableClasses = await this.prisma.class.findMany({
            where: {
                teacher_id: command.teacherId,
                status: _client.ClassStatus.PENDING_DELETE,
                deleted_at: {
                    lte: thirtyDaysAgo
                },
                lessons: {
                    none: {}
                },
                exams: {
                    none: {}
                },
                transactions: {
                    none: {}
                }
            },
            select: {
                id: true
            }
        });
        if (!deletableClasses.length) {
            return {
                deletedCount: 0,
                message: "Không có lớp nào đủ điều kiện xóa vĩnh viễn."
            };
        }
        const deleted = await this.prisma.class.deleteMany({
            where: {
                id: {
                    in: deletableClasses.map((item)=>item.id)
                }
            }
        });
        return {
            deletedCount: deleted.count,
            message: `Đã xóa vĩnh viễn ${deleted.count} lớp học quá hạn 30 ngày trong thùng rác.`
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
CleanupMyTrashClassesHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_cleanupmytrashclassescommand.CleanupMyTrashClassesCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], CleanupMyTrashClassesHandler);

//# sourceMappingURL=cleanup-my-trash-classes.handler.js.map