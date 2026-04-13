"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SharedModule", {
    enumerable: true,
    get: function() {
        return SharedModule;
    }
});
const _common = require("@nestjs/common");
const _cachemanager = require("@nestjs/cache-manager");
const _mailermodule = require("./mailer/mailer.module");
const _systemsettingservice = require("./settings/system-setting.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SharedModule = class SharedModule {
};
SharedModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        imports: [
            _mailermodule.MailerModule,
            _cachemanager.CacheModule.register()
        ],
        providers: [
            _systemsettingservice.SystemSettingService
        ],
        exports: [
            _mailermodule.MailerModule,
            _cachemanager.CacheModule,
            _systemsettingservice.SystemSettingService
        ]
    })
], SharedModule);

//# sourceMappingURL=shared.module.js.map