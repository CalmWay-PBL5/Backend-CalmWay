"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SystemSettingService", {
    enumerable: true,
    get: function() {
        return SystemSettingService;
    }
});
const _common = require("@nestjs/common");
const _cachemanager = require("@nestjs/cache-manager");
const _cachemanager1 = require("cache-manager");
const _prismaservice = require("../../infrastructure/database/prisma.service");
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
let SystemSettingService = class SystemSettingService {
    async getAsNumber(key) {
        const cacheKey = `SYSTEM_SETTING_${key}`;
        let value = await this.cacheManager.get(cacheKey);
        if (!value) {
            const setting = await this.prisma.systemSetting.findUnique({
                where: {
                    key
                }
            });
            value = setting?.value || "0";
            await this.cacheManager.set(cacheKey, value, 3600);
        }
        return Number(value);
    }
    async getAsBoolean(key) {
        const cacheKey = `SYSTEM_SETTING_${key}`;
        let value = await this.cacheManager.get(cacheKey);
        if (!value) {
            const setting = await this.prisma.systemSetting.findUnique({
                where: {
                    key
                }
            });
            value = setting?.value || "false";
            await this.cacheManager.set(cacheKey, value, 3600);
        }
        return value === "true";
    }
    constructor(prisma, cacheManager){
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
};
SystemSettingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(1, (0, _common.Inject)(_cachemanager.CACHE_MANAGER)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _cachemanager1.Cache === "undefined" ? Object : _cachemanager1.Cache
    ])
], SystemSettingService);

//# sourceMappingURL=system-setting.service.js.map