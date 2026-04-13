"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RedisService", {
    enumerable: true,
    get: function() {
        return RedisService;
    }
});
const _common = require("@nestjs/common");
const _appconfigservice = require("../../core/config/app-config.service");
const _ioredis = /*#__PURE__*/ _interop_require_default(require("ioredis"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RedisService = class RedisService {
    getClient() {
        return this.redisClient;
    }
    async onModuleDestroy() {
        await this.redisClient.quit();
        this.logger.log("🛑 Disconnected from Redis.");
    }
    constructor(config){
        this.config = config;
        this.logger = new _common.Logger(RedisService.name);
        this.redisClient = new _ioredis.default(this.config.get("REDIS_URL"), {
            password: this.config.get("REDIS_PASSWORD"),
            retryStrategy: (times)=>{
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });
        this.redisClient.on("connect", ()=>{
            this.logger.log("🟢 Successfully connected to Redis.");
        });
        this.redisClient.on("error", (err)=>{
            this.logger.error("❌ Redis connection error:", err.message);
        });
    }
};
RedisService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], RedisService);

//# sourceMappingURL=redis.service.js.map