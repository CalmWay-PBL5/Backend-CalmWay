"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CoreModule", {
    enumerable: true,
    get: function() {
        return CoreModule;
    }
});
const _common = require("@nestjs/common");
const _appconfigmodule = require("./config/app-config.module");
const _appconfigservice = require("./config/app-config.service");
const _cqrs = require("@nestjs/cqrs");
const _throttler = require("@nestjs/throttler");
const _throttlerstorageredis = require("@nest-lab/throttler-storage-redis");
const _healthmodule = require("./health/health.module");
const _redisservice = require("../infrastructure/redis/redis.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CoreModule = class CoreModule {
};
CoreModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule,
            _appconfigmodule.AppConfigModule,
            _healthmodule.HealthModule,
            _throttler.ThrottlerModule.forRootAsync({
                // 🚀 BUG FIX: Tiêm RedisService vào để xài chung kết nối ổn định
                inject: [
                    _appconfigservice.AppConfigService,
                    _redisservice.RedisService
                ],
                useFactory: (config, redisService)=>({
                        throttlers: [
                            {
                                name: "default",
                                ttl: 60000,
                                limit: 100
                            },
                            {
                                name: "auth",
                                ttl: 60000,
                                limit: 5
                            }
                        ],
                        // Thay vì tạo kết nối mới dễ bị treo, lấy client từ RedisService
                        storage: new _throttlerstorageredis.ThrottlerStorageRedisService(redisService.getClient())
                    })
            })
        ],
        exports: [
            _cqrs.CqrsModule,
            _appconfigmodule.AppConfigModule,
            _throttler.ThrottlerModule
        ]
    })
], CoreModule);

//# sourceMappingURL=core.module.js.map