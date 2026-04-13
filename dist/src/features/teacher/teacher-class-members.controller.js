"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeacherClassMembersController", {
    enumerable: true,
    get: function() {
        return TeacherClassMembersController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _createmyclassmemberapi = require("./class-members/create-my-class-member.api");
const _listmyclassmembersapi = require("./class-members/list-my-class-members.api");
const _addmyclassmembercommand = require("./class-members/add-my-class-member.command");
const _listmyclassmembersquery = require("./class-members/list-my-class-members.query");
const _removemyclassmembercommand = require("./class-members/remove-my-class-member.command");
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
let TeacherClassMembersController = class TeacherClassMembersController {
    async add(req, dto) {
        return await this.commandBus.execute(new _addmyclassmembercommand.AddMyClassMemberCommand(req.user.id, dto));
    }
    async listByClass(req, classId, query) {
        return await this.queryBus.execute(new _listmyclassmembersquery.ListMyClassMembersQuery(req.user.id, classId, query.status));
    }
    async remove(req, classId, studentId) {
        return await this.commandBus.execute(new _removemyclassmembercommand.RemoveMyClassMemberCommand(req.user.id, classId, studentId));
    }
    constructor(commandBus, queryBus){
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _createmyclassmemberapi.CreateMyClassMemberDto === "undefined" ? Object : _createmyclassmemberapi.CreateMyClassMemberDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassMembersController.prototype, "add", null);
_ts_decorate([
    (0, _common.Get)("class/:classId"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("classId")),
    _ts_param(2, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        typeof _listmyclassmembersapi.ListMyClassMembersDto === "undefined" ? Object : _listmyclassmembersapi.ListMyClassMembersDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassMembersController.prototype, "listByClass", null);
_ts_decorate([
    (0, _common.Delete)("class/:classId/student/:studentId"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("classId")),
    _ts_param(2, (0, _common.Param)("studentId")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherClassMembersController.prototype, "remove", null);
TeacherClassMembersController = _ts_decorate([
    (0, _common.Controller)([
        "teachers/me/class-members",
        "class-members"
    ]),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.LECTURER),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus,
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus
    ])
], TeacherClassMembersController);

//# sourceMappingURL=teacher-class-members.controller.js.map