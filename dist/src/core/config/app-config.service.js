"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppConfigService", {
    enumerable: true,
    get: function() {
        return AppConfigService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _envvalidation = require("./env.validation");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AppConfigService = class AppConfigService {
    get(key) {
        return this.configService.get(key, {
            infer: true
        });
    }
    get isProduction() {
        return this.get('NODE_ENV') === _envvalidation.Environment.Production;
    }
    get isDevelopment() {
        return this.get('NODE_ENV') === _envvalidation.Environment.Development;
    }
    constructor(configService){
        this.configService = configService;
    }
};
AppConfigService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], AppConfigService);

//# sourceMappingURL=app-config.service.js.map