"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminClassesController", {
    enumerable: true,
    get: function() {
        return AdminClassesController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _getadminclassdetailquery = require("./classes/get-admin-class-detail.query");
const _pauseclassbyadmincommand = require("./classes/pause-class-by-admin.command");
const _resumeclassbyadmincommand = require("./classes/resume-class-by-admin.command");
const _listadminclassesapi = require("./classes/list-admin-classes.api");
const _listadminclassesquery = require("./classes/list-admin-classes.query");
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
let AdminClassesController = class AdminClassesController {
    async list(query) {
        const status = this.normalizeStatus(query.status);
        const keyword = query.q?.trim();
        return await this.queryBus.execute(new _listadminclassesquery.ListAdminClassesQuery(keyword || undefined, status, query.page, query.limit));
    }
    async getDetail(classId) {
        return await this.queryBus.execute(new _getadminclassdetailquery.GetAdminClassDetailQuery(classId));
    }
    async pause(classId) {
        return await this.commandBus.execute(new _pauseclassbyadmincommand.PauseClassByAdminCommand(classId));
    }
    async resume(classId) {
        return await this.commandBus.execute(new _resumeclassbyadmincommand.ResumeClassByAdminCommand(classId));
    }
    normalizeStatus(rawStatus) {
        if (!rawStatus) {
            return undefined;
        }
        const normalized = rawStatus.trim().toUpperCase();
        if (!normalized || normalized === "ALL") {
            return undefined;
        }
        if (!(normalized in _client.ClassStatus)) {
            throw new _common.BadRequestException("Giá trị status không hợp lệ.");
        }
        return normalized;
    }
    constructor(queryBus, commandBus){
        this.queryBus = queryBus;
        this.commandBus = commandBus;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _listadminclassesapi.ListAdminClassesDto === "undefined" ? Object : _listadminclassesapi.ListAdminClassesDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminClassesController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(":id"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminClassesController.prototype, "getDetail", null);
_ts_decorate([
    (0, _common.Patch)(":id/pause"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminClassesController.prototype, "pause", null);
_ts_decorate([
    (0, _common.Patch)(":id/resume"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminClassesController.prototype, "resume", null);
AdminClassesController = _ts_decorate([
    (0, _common.Controller)("admin/classes"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.ADMIN),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus,
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], AdminClassesController);

//# sourceMappingURL=admin-classes.controller.js.map