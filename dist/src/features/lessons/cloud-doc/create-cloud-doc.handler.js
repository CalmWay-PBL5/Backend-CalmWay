"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCloudDocHandler", {
    enumerable: true,
    get: function() {
        return CreateCloudDocHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _createclouddoccommand = require("./create-cloud-doc.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateCloudDocHandler = class CreateCloudDocHandler {
    async execute(command) {
        const { actorId, dto } = command;
        await this.assertTeacherOwnsClass(actorId, dto.classId);
        const processed = this.processCloudUrl(dto.url);
        const maxOrder = await this.prisma.lesson.aggregate({
            where: {
                class_id: dto.classId
            },
            _max: {
                order_index: true
            }
        });
        const created = await this.prisma.lesson.create({
            data: {
                class_id: dto.classId,
                title: dto.title.trim(),
                content_type: _client.ContentType.CLOUD_DOC,
                url: processed.embedUrl,
                body_text: JSON.stringify({
                    displayMode: processed.displayMode,
                    fileType: processed.fileType,
                    originalUrl: dto.url
                }),
                order_index: (maxOrder._max.order_index ?? -1) + 1
            }
        });
        return {
            id: created.id,
            classId: created.class_id,
            title: created.title,
            url: created.url,
            contentType: created.content_type,
            orderIndex: created.order_index,
            metadata: this.safeParseMetadata(created.body_text),
            createdAt: created.created_at,
            updatedAt: created.updated_at
        };
    }
    async assertTeacherOwnsClass(teacherId, classId) {
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: classId,
                teacher_id: teacherId,
                status: _client.ClassStatus.ACTIVE
            },
            select: {
                id: true
            }
        });
        if (!classItem) {
            throw new _common.ForbiddenException("Bạn không có quyền tạo tài liệu cho lớp học này.");
        }
    }
    processCloudUrl(rawUrl) {
        let embedUrl = rawUrl;
        let displayMode = "EMBED";
        let fileType = "EXTERNAL";
        try {
            if (rawUrl.includes("docs.google.com")) {
                fileType = "GOOGLE_OFFICE";
                embedUrl = rawUrl.replace(/\/(edit|view|present|copy|share).*$/, "/preview");
            } else if (rawUrl.includes("drive.google.com/file/d/")) {
                fileType = "DRIVE_FILE";
                const fileId = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
                if (fileId) {
                    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                }
            } else if (rawUrl.includes("drive.google.com/drive/folders/")) {
                fileType = "DRIVE_FOLDER";
                displayMode = "REDIRECT";
            } else if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
                fileType = "YOUTUBE";
                const videoId = rawUrl.includes("v=") ? new URL(rawUrl).searchParams.get("v") : rawUrl.split("/").pop();
                if (!videoId) {
                    throw new _common.BadRequestException("Không thể nhận diện video YouTube.");
                }
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        } catch (error) {
            if (error instanceof _common.BadRequestException) {
                throw error;
            }
            displayMode = "REDIRECT";
        }
        return {
            embedUrl,
            displayMode,
            fileType
        };
    }
    safeParseMetadata(raw) {
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch  {
            return null;
        }
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
CreateCloudDocHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_createclouddoccommand.CreateCloudDocCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], CreateCloudDocHandler);

//# sourceMappingURL=create-cloud-doc.handler.js.map