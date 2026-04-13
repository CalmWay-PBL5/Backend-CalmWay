"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MinioService", {
    enumerable: true,
    get: function() {
        return MinioService;
    }
});
const _common = require("@nestjs/common");
const _appconfigservice = require("../../core/config/app-config.service");
const _minio = /*#__PURE__*/ _interop_require_wildcard(require("minio"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
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
let MinioService = class MinioService {
    async onModuleInit() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, "us-east-1");
                this.logger.log(`🪣 Created MinIO bucket: ${this.bucketName}`);
            } else {
                this.logger.log(`🪣 MinIO bucket ready: ${this.bucketName}`);
            }
        } catch (error) {
            this.logger.error("❌ Failed to initialize MinIO bucket", error);
            throw error;
        }
    }
    getClient() {
        return this.minioClient;
    }
    getBucketName() {
        return this.bucketName;
    }
    parseEndpoint(endpoint) {
        const normalized = endpoint.includes("://") ? endpoint : `http://${endpoint}`;
        const url = new URL(normalized);
        return {
            endPoint: url.hostname,
            port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
            useSSL: url.protocol === "https:"
        };
    }
    constructor(config){
        this.config = config;
        this.logger = new _common.Logger(MinioService.name);
        const endpoint = this.config.get("S3_ENDPOINT");
        const parsedEndpoint = this.parseEndpoint(endpoint);
        this.minioClient = new _minio.Client({
            endPoint: parsedEndpoint.endPoint,
            port: parsedEndpoint.port,
            useSSL: parsedEndpoint.useSSL,
            accessKey: this.config.get("S3_ACCESS_KEY"),
            secretKey: this.config.get("S3_SECRET_KEY")
        });
        this.bucketName = this.config.get("S3_BUCKET_NAME");
    }
};
MinioService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], MinioService);

//# sourceMappingURL=minio.service.js.map