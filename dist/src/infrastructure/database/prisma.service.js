"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PrismaService", {
    enumerable: true,
    get: function() {
        return PrismaService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _adapterpg = require("@prisma/adapter-pg");
const _pg = require("pg");
const _appconfigservice = require("../../core/config/app-config.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PrismaService = class PrismaService extends _client.PrismaClient {
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log("📦 Successfully connected to PostgreSQL via Prisma v7 Adapter.");
        } catch (error) {
            this.logger.error("❌ Failed to connect to the database", error);
            throw error;
        }
    }
    async onApplicationShutdown(signal) {
        if (this.isDisconnected) {
            return;
        }
        this.logger.log(`🛑 Received shutdown signal${signal ? ` (${signal})` : ""}. Disconnecting Prisma...`);
        await this.$disconnect();
        this.isDisconnected = true;
        this.logger.log("🛑 Disconnected from PostgreSQL.");
    }
    constructor(configService){
        const databaseUrl = configService.get("DATABASE_URL");
        const pool = new _pg.Pool({
            connectionString: databaseUrl
        });
        const adapter = new _adapterpg.PrismaPg(pool);
        super({
            adapter,
            log: [
                "error",
                "warn"
            ],
            errorFormat: "colorless"
        }), this.logger = new _common.Logger(PrismaService.name), this.isDisconnected = false;
    }
};
PrismaService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], PrismaService);

//# sourceMappingURL=prisma.service.js.map