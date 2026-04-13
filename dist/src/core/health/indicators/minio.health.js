"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MinioHealthIndicator", {
    enumerable: true,
    get: function() {
        return MinioHealthIndicator;
    }
});
const _common = require("@nestjs/common");
const _terminus = require("@nestjs/terminus");
const _minioservice = require("../../../infrastructure/storage/minio.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let MinioHealthIndicator = class MinioHealthIndicator extends _terminus.HealthIndicator {
    async isHealthy(key) {
        try {
            const bucketName = this.minioService.getBucketName();
            const exists = await this.minioService.getClient().bucketExists(bucketName);
            if (!exists) {
                throw new Error(`Bucket "${bucketName}" does not exist`);
            }
            return this.getStatus(key, true, {
                message: "MinIO is up and responding"
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "MinIO check failed";
            throw new _terminus.HealthCheckError("MinIO Health Check failed", this.getStatus(key, false, {
                message
            }));
        }
    }
    constructor(minioService){
        super(), this.minioService = minioService;
    }
};
MinioHealthIndicator = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _minioservice.MinioService === "undefined" ? Object : _minioservice.MinioService
    ])
], MinioHealthIndicator);

//# sourceMappingURL=minio.health.js.map