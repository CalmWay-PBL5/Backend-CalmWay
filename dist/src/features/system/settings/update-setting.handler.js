"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateSettingHandler", {
    enumerable: true,
    get: function() {
        return UpdateSettingHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _common = require("@nestjs/common");
const _cachemanager = require("@nestjs/cache-manager");
const _cachemanager1 = require("cache-manager");
const _updatesettingcommand = require("./update-setting.command");
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
let UpdateSettingHandler = class UpdateSettingHandler {
    async execute(command) {
        const { key, adminId, dto } = command;
        const setting = await this.prisma.systemSetting.findUnique({
            where: {
                key
            }
        });
        if (!setting) {
            throw new _common.NotFoundException(`Không tìm thấy cấu hình với mã: ${key}`);
        }
        await this.prisma.systemSetting.update({
            where: {
                key
            },
            data: {
                value: dto.value,
                updatedBy: adminId
            }
        });
        await this.cacheManager.del(`SYSTEM_SETTING_${key}`);
        this.logger.log(`Admin [${adminId}] đã thay đổi cấu hình [${key}] thành [${dto.value}]`);
        return {
            message: "Đã cập nhật cấu hình hệ thống thành công."
        };
    }
    constructor(prisma, cacheManager){
        this.prisma = prisma;
        this.cacheManager = cacheManager;
        this.logger = new _common.Logger(UpdateSettingHandler.name);
    }
};
UpdateSettingHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_updatesettingcommand.UpdateSettingCommand),
    _ts_param(1, (0, _common.Inject)(_cachemanager.CACHE_MANAGER)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _cachemanager1.Cache === "undefined" ? Object : _cachemanager1.Cache
    ])
], UpdateSettingHandler);

//# sourceMappingURL=update-setting.handler.js.map