"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InfrastructureModule", {
    enumerable: true,
    get: function() {
        return InfrastructureModule;
    }
});
const _common = require("@nestjs/common");
const _bullmq = require("@nestjs/bullmq");
const _prismaservice = require("./database/prisma.service");
const _redisservice = require("./redis/redis.service");
const _minioservice = require("./storage/minio.service");
const _s3storageservice = require("./storage/s3-storage.service");
const _bullconfigservice = require("./queue/bull-config.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let InfrastructureModule = class InfrastructureModule {
};
InfrastructureModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        imports: [
            _bullmq.BullModule.forRootAsync({
                useClass: _bullconfigservice.BullConfigService
            })
        ],
        providers: [
            _prismaservice.PrismaService,
            _redisservice.RedisService,
            _minioservice.MinioService,
            _s3storageservice.S3StorageService,
            _bullconfigservice.BullConfigService
        ],
        exports: [
            _prismaservice.PrismaService,
            _redisservice.RedisService,
            _minioservice.MinioService,
            _s3storageservice.S3StorageService,
            _bullmq.BullModule
        ]
    })
], InfrastructureModule);

//# sourceMappingURL=infrastructure.module.js.map