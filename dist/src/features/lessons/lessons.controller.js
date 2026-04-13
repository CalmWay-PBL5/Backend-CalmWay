"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LessonsController", {
    enumerable: true,
    get: function() {
        return LessonsController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _createclouddocapi = require("./cloud-doc/create-cloud-doc.api");
const _createclouddoccommand = require("./cloud-doc/create-cloud-doc.command");
const _listclouddocsquery = require("./cloud-doc/list-cloud-docs.query");
const _updateclouddoctitleapi = require("./cloud-doc/update-cloud-doc-title.api");
const _updateclouddoctitlecommand = require("./cloud-doc/update-cloud-doc-title.command");
const _deleteclouddoccommand = require("./cloud-doc/delete-cloud-doc.command");
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
let LessonsController = class LessonsController {
    async createCloudDoc(req, dto) {
        return await this.commandBus.execute(new _createclouddoccommand.CreateCloudDocCommand(req.user.id, dto));
    }
    async getCloudDocs(req, classId) {
        return await this.queryBus.execute(new _listclouddocsquery.ListClassCloudDocsQuery(req.user.id, classId));
    }
    async updateTitle(req, lessonId, dto) {
        return await this.commandBus.execute(new _updateclouddoctitlecommand.UpdateCloudDocTitleCommand(req.user.id, lessonId, dto.title));
    }
    async remove(req, lessonId) {
        await this.commandBus.execute(new _deleteclouddoccommand.DeleteCloudDocCommand(req.user.id, lessonId));
    }
    constructor(commandBus, queryBus){
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
};
_ts_decorate([
    (0, _common.Post)("cloud-doc"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _createclouddocapi.CreateCloudDocDto === "undefined" ? Object : _createclouddocapi.CreateCloudDocDto
    ]),
    _ts_metadata("design:returntype", Promise)
], LessonsController.prototype, "createCloudDoc", null);
_ts_decorate([
    (0, _common.Get)("class/:classId/cloud-docs"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("classId")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LessonsController.prototype, "getCloudDocs", null);
_ts_decorate([
    (0, _common.Patch)(":id/title"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("id")),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        typeof _updateclouddoctitleapi.UpdateCloudDocTitleDto === "undefined" ? Object : _updateclouddoctitleapi.UpdateCloudDocTitleDto
    ]),
    _ts_metadata("design:returntype", Promise)
], LessonsController.prototype, "updateTitle", null);
_ts_decorate([
    (0, _common.Delete)(":id"),
    (0, _common.HttpCode)(_common.HttpStatus.NO_CONTENT),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("id")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LessonsController.prototype, "remove", null);
LessonsController = _ts_decorate([
    (0, _common.Controller)("lessons"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus,
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus
    ])
], LessonsController);

//# sourceMappingURL=lessons.controller.js.map