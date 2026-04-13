"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeacherClassesController", {
    enumerable: true,
    get: function() {
        return TeacherClassesController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _fastify = require("fastify");
const _client = require("@prisma/client");
const _enterprisefilepipe = require("../../shared/file-upload/enterprise-file.pipe");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _createmyclassapi = require("./classes/create-my-class.api");
const _updatemyclassapi = require("./classes/update-my-class.api");
const _createmyclasscommand = require("./classes/create-my-class.command");
const _listmyclassesquery = require("./classes/list-my-classes.query");
const _getmyclassdashboardstatsquery = require("./classes/get-my-class-dashboard-stats.query");
const _listmytrashclassesquery = require("./classes/list-my-trash-classes.query");
const _exportmyclassesquery = require("./classes/export-my-classes.query");
const _exportmyclassmembersquery = require("./classes/export-my-class-members.query");
const _getmyclassquery = require("./classes/get-my-class.query");
const _updatemyclasscommand = require("./classes/update-my-class.command");
const _movemyclasstotrashcommand = require("./classes/move-my-class-to-trash.command");
const _restoremyclasscommand = require("./classes/restore-my-class.command");
const _listmyclassdetailedreviewsquery = require("./classes/list-my-class-detailed-reviews.query");
const _cleanupmytrashclassescommand = require("./classes/cleanup-my-trash-classes.command");
const _listmysubjectsquery = require("./classes/list-my-subjects.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let TeacherClassesController = class TeacherClassesController {
    async getSubjects() {
        return await this.queryBus.execute(new _listmysubjectsquery.ListMySubjectsQuery());
    }
    async getDetailedReviews(req) {
        return await this.queryBus.execute(new _listmyclassdetailedreviewsquery.ListMyClassDetailedReviewsQuery(req.user.id));
    }
    async create(req, dto) {
        const payload = await this.extractPayload(req, dto);
        return await this.commandBus.execute(new _createmyclasscommand.CreateMyClassCommand(req.user.id, payload.dto, payload.coverImageFile));
    }
    async findAll(req) {
        return await this.queryBus.execute(new _listmyclassesquery.ListMyClassesQuery(req.user.id));
    }
    async getDashboardStats(req) {
        return await this.queryBus.execute(new _getmyclassdashboardstatsquery.GetMyClassDashboardStatsQuery(req.user.id));
    }
    async findTrash(req) {
        return await this.queryBus.execute(new _listmytrashclassesquery.ListMyTrashClassesQuery(req.user.id));
    }
    async cleanupTrash(req) {
        return await this.commandBus.execute(new _cleanupmytrashclassescommand.CleanupMyTrashClassesCommand(req.user.id));
    }
    async exportAll(req, res) {
        const exported = await this.queryBus.execute(new _exportmyclassesquery.ExportMyClassesQuery(req.user.id));
        res.header("Content-Type", "text/csv; charset=utf-8");
        res.header("Content-Disposition", `attachment; filename=\"${exported.fileName}\"`);
        return `\uFEFF${exported.csv}`;
    }
    async exportMembers(req, classId, res) {
        const exported = await this.queryBus.execute(new _exportmyclassmembersquery.ExportMyClassMembersQuery(req.user.id, classId));
        res.header("Content-Type", "text/csv; charset=utf-8");
        res.header("Content-Disposition", `attachment; filename=\"${exported.fileName}\"`);
        return `\uFEFF${exported.csv}`;
    }
    async findOne(req, classId) {
        return await this.queryBus.execute(new _getmyclassquery.GetMyClassQuery(req.user.id, classId));
    }
    async update(req, classId, dto) {
        const payload = await this.extractPayload(req, dto);
        return await this.commandBus.execute(new _updatemyclasscommand.UpdateMyClassCommand(req.user.id, classId, payload.dto, payload.coverImageFile));
    }
    async replace(req, classId, dto) {
        const payload = await this.extractPayload(req, dto);
        return await this.commandBus.execute(new _updatemyclasscommand.UpdateMyClassCommand(req.user.id, classId, payload.dto, payload.coverImageFile));
    }
    async remove(req, classId) {
        return await this.commandBus.execute(new _movemyclasstotrashcommand.MoveMyClassToTrashCommand(req.user.id, classId));
    }
    async restore(req, classId) {
        return await this.commandBus.execute(new _restoremyclasscommand.RestoreMyClassCommand(req.user.id, classId));
    }
    async extractPayload(req, dto) {
        const isMultipart = typeof req.isMultipart === "function" ? req.isMultipart() : false;
        if (!isMultipart) {
            return {
                dto,
                coverImageFile: undefined
            };
        }
        const iterator = req.parts?.();
        if (!iterator) {
            throw new _common.BadRequestException("Yêu cầu upload không hợp lệ.");
        }
        const parsedDto = {};
        let coverImageFile;
        for await (const part of iterator){
            if (part.type === "field") {
                const fieldName = String(part.fieldname ?? "").trim();
                const value = this.toOptionalText(part.value);
                if (fieldName === "title") {
                    parsedDto.title = value;
                    continue;
                }
                if (fieldName === "description") {
                    parsedDto.description = value;
                    continue;
                }
                if (fieldName === "price") {
                    parsedDto.price = value;
                    continue;
                }
                if (fieldName === "type") {
                    parsedDto.type = value;
                    continue;
                }
                if (fieldName === "maxStudents" || fieldName === "max_students") {
                    parsedDto.maxStudents = value;
                    continue;
                }
                if (fieldName === "subjectId" || fieldName === "subject_id") {
                    parsedDto.subjectId = value;
                }
                continue;
            }
            if (part.type !== "file") {
                continue;
            }
            const fieldName = String(part.fieldname ?? "").trim();
            const buffer = await part.toBuffer();
            if (!this.coverFieldNames.has(fieldName)) {
                continue;
            }
            if (coverImageFile) {
                throw new _common.BadRequestException("Chỉ được gửi tối đa 1 ảnh bìa lớp học.");
            }
            coverImageFile = this.coverPipe.transform(this.toExpressFile(part, buffer));
        }
        return {
            dto: parsedDto,
            coverImageFile
        };
    }
    toOptionalText(value) {
        if (typeof value !== "string") {
            return undefined;
        }
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    toExpressFile(multipartFile, buffer) {
        return {
            fieldname: multipartFile.fieldname || "file",
            originalname: multipartFile.filename || "upload.bin",
            encoding: multipartFile.encoding || "7bit",
            mimetype: multipartFile.mimetype || "application/octet-stream",
            size: buffer.length,
            buffer,
            destination: "",
            filename: multipartFile.filename || "upload.bin",
            path: "",
            stream: multipartFile.file
        };
    }
    constructor(queryBus, commandBus){
        this.queryBus = queryBus;
        this.commandBus = commandBus;
        this.coverPipe = new _enterprisefilepipe.EnterpriseFilePipe("CLASS_COVER");
        this.coverFieldNames = new Set([
            "coverImage",
            "cover_image",
            "cover"
        ]);
    }
};
_ts_decorate([
    (0, _common.Get)("subjects"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "getSubjects", null);
_ts_decorate([
    (0, _common.Get)("reviews/detailed"),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "getDetailedReviews", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _createmyclassapi.CreateMyClassDto === "undefined" ? Object : _createmyclassapi.CreateMyClassDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)("dashboard/stats"),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "getDashboardStats", null);
_ts_decorate([
    (0, _common.Get)("trash"),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "findTrash", null);
_ts_decorate([
    (0, _common.Post)("trash/cleanup"),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "cleanupTrash", null);
_ts_decorate([
    (0, _common.Get)("export/all"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _fastify.FastifyReply === "undefined" ? Object : _fastify.FastifyReply
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "exportAll", null);
_ts_decorate([
    (0, _common.Get)("export/:id/members"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("id")),
    _ts_param(2, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        typeof _fastify.FastifyReply === "undefined" ? Object : _fastify.FastifyReply
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "exportMembers", null);
_ts_decorate([
    (0, _common.Get)(":id"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("id")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(":id"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("id")),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        typeof _updatemyclassapi.UpdateMyClassDto === "undefined" ? Object : _updatemyclassapi.UpdateMyClassDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Put)(":id"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("id")),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        typeof _updatemyclassapi.UpdateMyClassDto === "undefined" ? Object : _updatemyclassapi.UpdateMyClassDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "replace", null);
_ts_decorate([
    (0, _common.Delete)(":id"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("id")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Patch)(":id/restore"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("id")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassesController.prototype, "restore", null);
TeacherClassesController = _ts_decorate([
    (0, _common.Controller)("teachers/me/classes"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.LECTURER),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus,
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], TeacherClassesController);

//# sourceMappingURL=teacher-classes.controller.js.map