"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HealthController", {
    enumerable: true,
    get: function() {
        return HealthController;
    }
});
const _common = require("@nestjs/common");
const _terminus = require("@nestjs/terminus");
const _databasehealth = require("./indicators/database.health");
const _redishealth = require("./indicators/redis.health");
const _miniohealth = require("./indicators/minio.health");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let HealthController = class HealthController {
    checkLiveness() {
        return this.health.check([
            ()=>this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),
            ()=>this.memory.checkRSS("memory_rss", 300 * 1024 * 1024)
        ]);
    }
    checkReadiness() {
        this.logger.debug("Running readiness health check");
        return this.health.check([
            ()=>this.databaseHealth.isHealthy("database"),
            ()=>this.redisHealth.isHealthy("redis"),
            ()=>this.minioHealth.isHealthy("minio")
        ]);
    }
    constructor(health, memory, databaseHealth, redisHealth, minioHealth){
        this.health = health;
        this.memory = memory;
        this.databaseHealth = databaseHealth;
        this.redisHealth = redisHealth;
        this.minioHealth = minioHealth;
        this.logger = new _common.Logger(HealthController.name);
    }
};
_ts_decorate([
    (0, _common.Get)("liveness"),
    (0, _terminus.HealthCheck)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], HealthController.prototype, "checkLiveness", null);
_ts_decorate([
    (0, _common.Get)("readiness"),
    (0, _terminus.HealthCheck)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], HealthController.prototype, "checkReadiness", null);
HealthController = _ts_decorate([
    (0, _common.Controller)("health"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _terminus.HealthCheckService === "undefined" ? Object : _terminus.HealthCheckService,
        typeof _terminus.MemoryHealthIndicator === "undefined" ? Object : _terminus.MemoryHealthIndicator,
        typeof _databasehealth.DatabaseHealthIndicator === "undefined" ? Object : _databasehealth.DatabaseHealthIndicator,
        typeof _redishealth.RedisHealthIndicator === "undefined" ? Object : _redishealth.RedisHealthIndicator,
        typeof _miniohealth.MinioHealthIndicator === "undefined" ? Object : _miniohealth.MinioHealthIndicator
    ])
], HealthController);

//# sourceMappingURL=health.controller.js.map