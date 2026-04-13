"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateCloudDocTitleHandler", {
    enumerable: true,
    get: function() {
        return UpdateCloudDocTitleHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _updateclouddoctitlecommand = require("./update-cloud-doc-title.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UpdateCloudDocTitleHandler = class UpdateCloudDocTitleHandler {
    async execute(command) {
        const lesson = await this.prisma.lesson.findUnique({
            where: {
                id: command.lessonId
            },
            select: {
                id: true,
                class_id: true,
                content_type: true
            }
        });
        if (!lesson || lesson.content_type !== _client.ContentType.CLOUD_DOC) {
            throw new _common.NotFoundException("Tài liệu không tồn tại.");
        }
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: lesson.class_id,
                teacher_id: command.actorId,
                status: _client.ClassStatus.ACTIVE
            },
            select: {
                id: true
            }
        });
        if (!classItem) {
            throw new _common.ForbiddenException("Bạn không có quyền chỉnh sửa tài liệu này.");
        }
        const updated = await this.prisma.lesson.update({
            where: {
                id: command.lessonId
            },
            data: {
                title: command.title.trim()
            }
        });
        return {
            id: updated.id,
            title: updated.title,
            updatedAt: updated.updated_at
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
UpdateCloudDocTitleHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_updateclouddoctitlecommand.UpdateCloudDocTitleCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], UpdateCloudDocTitleHandler);

//# sourceMappingURL=update-cloud-doc-title.handler.js.map