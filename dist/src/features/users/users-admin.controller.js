"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersAdminController", {
    enumerable: true,
    get: function() {
        return UsersAdminController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _togglestatusapi = require("./toggle-status/toggle-status.api");
const _togglestatuscommand = require("./toggle-status/toggle-status.command");
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
let UsersAdminController = class UsersAdminController {
    async toggleStatus(targetUserId, dto, req) {
        if (!dto.isActive && !dto.reason) {
            throw new _common.BadRequestException("Vui lòng cung cấp lý do khóa tài khoản.");
        }
        return await this.commandBus.execute(new _togglestatuscommand.ToggleUserStatusCommand(targetUserId, req.user.id, dto));
    }
    constructor(commandBus){
        this.commandBus = commandBus;
    }
};
_ts_decorate([
    (0, _common.Patch)(":id/status"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _togglestatusapi.ToggleUserStatusDto === "undefined" ? Object : _togglestatusapi.ToggleUserStatusDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], UsersAdminController.prototype, "toggleStatus", null);
UsersAdminController = _ts_decorate([
    (0, _common.Controller)("admin/users"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.ADMIN),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], UsersAdminController);

//# sourceMappingURL=users-admin.controller.js.map