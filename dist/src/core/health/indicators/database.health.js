"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DatabaseHealthIndicator", {
    enumerable: true,
    get: function() {
        return DatabaseHealthIndicator;
    }
});
const _common = require("@nestjs/common");
const _terminus = require("@nestjs/terminus");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DatabaseHealthIndicator = class DatabaseHealthIndicator extends _terminus.HealthIndicator {
    async isHealthy(key) {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return this.getStatus(key, true, {
                message: "Database is up"
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Database check failed";
            throw new _terminus.HealthCheckError("Database Health Check failed", this.getStatus(key, false, {
                message
            }));
        }
    }
    constructor(prisma){
        super(), this.prisma = prisma;
    }
};
DatabaseHealthIndicator = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DatabaseHealthIndicator);

//# sourceMappingURL=database.health.js.map