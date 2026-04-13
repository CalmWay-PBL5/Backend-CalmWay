"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RedisHealthIndicator", {
    enumerable: true,
    get: function() {
        return RedisHealthIndicator;
    }
});
const _common = require("@nestjs/common");
const _terminus = require("@nestjs/terminus");
const _redisservice = require("../../../infrastructure/redis/redis.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RedisHealthIndicator = class RedisHealthIndicator extends _terminus.HealthIndicator {
    async isHealthy(key) {
        try {
            const result = await this.redisService.getClient().ping();
            if (result !== "PONG") {
                throw new Error(`Unexpected redis ping response: ${result}`);
            }
            return this.getStatus(key, true, {
                message: "Redis is up"
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Redis ping failed";
            throw new _terminus.HealthCheckError("Redis Health Check failed", this.getStatus(key, false, {
                message
            }));
        }
    }
    constructor(redisService){
        super(), this.redisService = redisService;
    }
};
RedisHealthIndicator = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _redisservice.RedisService === "undefined" ? Object : _redisservice.RedisService
    ])
], RedisHealthIndicator);

//# sourceMappingURL=redis.health.js.map