"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RestoreMyClassHandler", {
    enumerable: true,
    get: function() {
        return RestoreMyClassHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _restoremyclasscommand = require("./restore-my-class.command");
const _classmapper = require("./class.mapper");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RestoreMyClassHandler = class RestoreMyClassHandler {
    async execute(command) {
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: command.classId,
                teacher_id: command.teacherId,
                status: _client.ClassStatus.PENDING_DELETE
            },
            select: {
                id: true
            }
        });
        if (!classItem) {
            throw new _common.NotFoundException("Không tìm thấy lớp học trong thùng rác.");
        }
        const restored = await this.prisma.class.update({
            where: {
                id: command.classId
            },
            data: {
                status: _client.ClassStatus.ACTIVE,
                deleted_at: null
            },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                transactions: {
                    select: {
                        user_id: true,
                        amount: true,
                        status: true
                    }
                },
                classMembers: {
                    select: {
                        student_id: true,
                        status: true,
                        joined_at: true
                    }
                }
            }
        });
        return (0, _classmapper.mapClassEntity)(restored);
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
RestoreMyClassHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_restoremyclasscommand.RestoreMyClassCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], RestoreMyClassHandler);

//# sourceMappingURL=restore-my-class.handler.js.map