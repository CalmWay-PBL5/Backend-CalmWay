"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BullConfigService", {
    enumerable: true,
    get: function() {
        return BullConfigService;
    }
});
const _common = require("@nestjs/common");
const _appconfigservice = require("../../core/config/app-config.service");
const _redisconnectionutil = require("../redis/redis-connection.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BullConfigService = class BullConfigService {
    createSharedConfiguration() {
        const connection = (0, _redisconnectionutil.parseRedisConnection)(this.config.get("REDIS_URL"), this.config.get("REDIS_PASSWORD"));
        return {
            connection,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000
                }
            }
        };
    }
    constructor(config){
        this.config = config;
    }
};
BullConfigService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], BullConfigService);

//# sourceMappingURL=bull-config.service.js.map