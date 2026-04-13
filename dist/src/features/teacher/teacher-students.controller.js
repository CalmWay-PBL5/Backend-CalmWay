"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeacherStudentsController", {
    enumerable: true,
    get: function() {
        return TeacherStudentsController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _fastify = require("fastify");
const _client = require("@prisma/client");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _getmyteacherstudentsapi = require("./students/get-my-teacher-students.api");
const _getmyteacherstudentsquery = require("./students/get-my-teacher-students.query");
const _searchmyteacherstudentsquery = require("./students/search-my-teacher-students.query");
const _getmyteacherstudentstatsquery = require("./students/get-my-teacher-student-stats.query");
const _getmyteacherstudentdetailquery = require("./students/get-my-teacher-student-detail.query");
const _exportmyteacherstudentsquery = require("./students/export-my-teacher-students.query");
const _exportmyteachercoursestudentsquery = require("./students/export-my-teacher-course-students.query");
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
let TeacherStudentsController = class TeacherStudentsController {
    async getAllStudents(req, query) {
        return await this.queryBus.execute(new _getmyteacherstudentsquery.GetMyTeacherStudentsQuery(req.user.id, query.skip, query.take));
    }
    async searchStudents(req, query) {
        const keyword = query.q?.trim();
        if (!keyword) {
            throw new _common.BadRequestException('Tham số "q" không được để trống.');
        }
        return await this.queryBus.execute(new _searchmyteacherstudentsquery.SearchMyTeacherStudentsQuery(req.user.id, keyword, query.skip, query.take));
    }
    async getStats(req) {
        return await this.queryBus.execute(new _getmyteacherstudentstatsquery.GetMyTeacherStudentStatsQuery(req.user.id));
    }
    async exportAll(req, res) {
        const exported = await this.queryBus.execute(new _exportmyteacherstudentsquery.ExportMyTeacherStudentsQuery(req.user.id));
        res.header("Content-Type", "text/csv; charset=utf-8");
        res.header("Content-Disposition", `attachment; filename=\"${exported.fileName}\"`);
        return `\uFEFF${exported.csv}`;
    }
    async exportByCourse(req, courseId, res) {
        const exported = await this.queryBus.execute(new _exportmyteachercoursestudentsquery.ExportMyTeacherCourseStudentsQuery(req.user.id, courseId));
        res.header("Content-Type", "text/csv; charset=utf-8");
        res.header("Content-Disposition", `attachment; filename=\"${exported.fileName}\"`);
        return `\uFEFF${exported.csv}`;
    }
    async getStudentDetail(req, studentId) {
        return await this.queryBus.execute(new _getmyteacherstudentdetailquery.GetMyTeacherStudentDetailQuery(req.user.id, studentId));
    }
    constructor(queryBus){
        this.queryBus = queryBus;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _getmyteacherstudentsapi.GetMyTeacherStudentsDto === "undefined" ? Object : _getmyteacherstudentsapi.GetMyTeacherStudentsDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherStudentsController.prototype, "getAllStudents", null);
_ts_decorate([
    (0, _common.Get)("search/query"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _getmyteacherstudentsapi.SearchMyTeacherStudentsDto === "undefined" ? Object : _getmyteacherstudentsapi.SearchMyTeacherStudentsDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherStudentsController.prototype, "searchStudents", null);
_ts_decorate([
    (0, _common.Get)("stats/overview"),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherStudentsController.prototype, "getStats", null);
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
], TeacherStudentsController.prototype, "exportAll", null);
_ts_decorate([
    (0, _common.Get)("export/course/:courseId"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("courseId")),
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
], TeacherStudentsController.prototype, "exportByCourse", null);
_ts_decorate([
    (0, _common.Get)(":studentId"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("studentId")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherStudentsController.prototype, "getStudentDetail", null);
TeacherStudentsController = _ts_decorate([
    (0, _common.Controller)("teachers/me/students"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.LECTURER),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus
    ])
], TeacherStudentsController);

//# sourceMappingURL=teacher-students.controller.js.map