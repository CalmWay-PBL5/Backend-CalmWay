"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ResumeClassByAdminHandler", {
    enumerable: true,
    get: function() {
        return ResumeClassByAdminHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _resumeclassbyadmincommand = require("./resume-class-by-admin.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ResumeClassByAdminHandler = class ResumeClassByAdminHandler {
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
        if (classItem.status !== _client.ClassStatus.PAUSED) {
            throw new _common.BadRequestException("Chỉ có thể mở lại lớp học đang tạm dừng.");
        }
        await this.prisma.class.update({
            where: {
                id: classItem.id
            },
            data: {
                status: _client.ClassStatus.ACTIVE,
                deleted_at: null
            }
        });
        return {
            message: "Đã mở lại lớp học."
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ResumeClassByAdminHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_resumeclassbyadmincommand.ResumeClassByAdminCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ResumeClassByAdminHandler);

//# sourceMappingURL=resume-class-by-admin.handler.js.map