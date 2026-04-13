"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SystemAdminController", {
    enumerable: true,
    get: function() {
        return SystemAdminController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _prismaservice = require("../../infrastructure/database/prisma.service");
const _updatesettingapi = require("./settings/update-setting.api");
const _updatesettingcommand = require("./settings/update-setting.command");
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
let SystemAdminController = class SystemAdminController {
    async getAllSettings() {
        return await this.prisma.systemSetting.findMany({
            orderBy: {
                key: "asc"
            }
        });
    }
    async updateSetting(key, dto, req) {
        return await this.commandBus.execute(new _updatesettingcommand.UpdateSettingCommand(key, req.user.id, dto));
    }
    constructor(commandBus, prisma){
        this.commandBus = commandBus;
        this.prisma = prisma;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], SystemAdminController.prototype, "getAllSettings", null);
_ts_decorate([
    (0, _common.Patch)(":key"),
    _ts_param(0, (0, _common.Param)("key")),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatesettingapi.UpdateSettingDto === "undefined" ? Object : _updatesettingapi.UpdateSettingDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], SystemAdminController.prototype, "updateSetting", null);
SystemAdminController = _ts_decorate([
    (0, _common.Controller)("admin/settings"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.ADMIN),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], SystemAdminController);

//# sourceMappingURL=system-admin.controller.js.map