"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SystemModule", {
    enumerable: true,
    get: function() {
        return SystemModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _systemadmincontroller = require("./system-admin.controller");
const _updatesettinghandler = require("./settings/update-setting.handler");
const _rolesguard = require("../auth/guards/roles.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SystemModule = class SystemModule {
};
SystemModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule
        ],
        controllers: [
            _systemadmincontroller.SystemAdminController
        ],
        providers: [
            _updatesettinghandler.UpdateSettingHandler,
            _rolesguard.RolesGuard
        ]
    })
], SystemModule);

//# sourceMappingURL=system.module.js.map