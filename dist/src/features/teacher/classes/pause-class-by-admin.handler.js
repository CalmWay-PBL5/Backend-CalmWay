"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PauseClassByAdminHandler", {
    enumerable: true,
    get: function() {
        return PauseClassByAdminHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _pauseclassbyadmincommand = require("./pause-class-by-admin.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PauseClassByAdminHandler = class PauseClassByAdminHandler {
    async execute(command) {
        const classItem = await this.prisma.class.findUnique({
            where: {
                id: command.classId
            },
            select: {
                id: true,
                status: true
            }
        });
        if (!classItem) {
            throw new _common.NotFoundException("Không tìm thấy lớp học.");
        }
        if (classItem.status === _client.ClassStatus.PAUSED) {
            throw new _common.BadRequestException("Lớp học đang ở trạng thái tạm dừng.");
        }
        if (classItem.status === _client.ClassStatus.PENDING_DELETE) {
            throw new _common.BadRequestException("Không thể tạm dừng lớp học đang ở thùng rác.");
        }
        await this.prisma.class.update({
            where: {
                id: classItem.id
            },
            data: {
                status: _client.ClassStatus.PAUSED
            }
        });
        return {
            message: "Đã tạm dừng lớp học."
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
PauseClassByAdminHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_pauseclassbyadmincommand.PauseClassByAdminCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], PauseClassByAdminHandler);

//# sourceMappingURL=pause-class-by-admin.handler.js.map