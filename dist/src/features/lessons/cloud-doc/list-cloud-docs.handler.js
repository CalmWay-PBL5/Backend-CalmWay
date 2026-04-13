"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ListCloudDocsHandler", {
    enumerable: true,
    get: function() {
        return ListCloudDocsHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _listclouddocsquery = require("./list-cloud-docs.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ListCloudDocsHandler = class ListCloudDocsHandler {
    async execute(query) {
        await this.assertCanAccessClass(query.actorId, query.classId);
        const lessons = await this.prisma.lesson.findMany({
            where: {
                class_id: query.classId,
                content_type: _client.ContentType.CLOUD_DOC
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return lessons.map((lesson)=>({
                id: lesson.id,
                classId: lesson.class_id,
                title: lesson.title,
                url: lesson.url,
                contentType: lesson.content_type,
                orderIndex: lesson.order_index,
                metadata: this.safeParseMetadata(lesson.body_text),
                createdAt: lesson.created_at,
                updatedAt: lesson.updated_at
            }));
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
        throw new _common.ForbiddenException("Bạn không có quyền xem tài liệu của lớp học này.");
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
ListCloudDocsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_listclouddocsquery.ListClassCloudDocsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ListCloudDocsHandler);

//# sourceMappingURL=list-cloud-docs.handler.js.map