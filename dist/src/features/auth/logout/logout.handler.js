"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LogoutHandler", {
    enumerable: true,
    get: function() {
        return LogoutHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _logoutcommand = require("./logout.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LogoutHandler = class LogoutHandler {
    async execute(command) {
        const { userId } = command;
        try {
            await this.prisma.user.updateMany({
                where: {
                    id: userId,
                    hashedRefreshToken: {
                        not: null
                    }
                },
                data: {
                    hashedRefreshToken: null
                }
            });
            this.logger.log(`User ${userId} successfully logged out. Refresh token revoked.`);
        } catch (error) {
            this.logger.error(`Failed to logout user ${userId}`, error);
        }
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(LogoutHandler.name);
    }
};
LogoutHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_logoutcommand.LogoutCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], LogoutHandler);

//# sourceMappingURL=logout.handler.js.map