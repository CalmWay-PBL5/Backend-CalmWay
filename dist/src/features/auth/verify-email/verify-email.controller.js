"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VerifyEmailController", {
    enumerable: true,
    get: function() {
        return VerifyEmailController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _appconfigservice = require("../../../core/config/app-config.service");
const _verifyemailapi = require("./verify-email.api");
const _verifyemailcommand = require("./verify-email.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let VerifyEmailController = class VerifyEmailController {
    async verifyEmail(query) {
        const frontendUrl = this.config.get("FRONTEND_URL");
        try {
            await this.commandBus.execute(new _verifyemailcommand.VerifyEmailCommand(query.token));
            return {
                statusCode: 302,
                url: `${frontendUrl}/login?verified=success`
            };
        } catch (error) {
            const tokenPreview = query.token ? query.token.substring(0, 8) : "missing";
            this.logger.error(`Verification failed for token: ${tokenPreview}...`);
            return {
                statusCode: 302,
                url: `${frontendUrl}/login?verified=error&reason=invalid_or_expired`
            };
        }
    }
    constructor(commandBus, config){
        this.commandBus = commandBus;
        this.config = config;
        this.logger = new _common.Logger(VerifyEmailController.name);
    }
};
_ts_decorate([
    (0, _common.Get)("verify"),
    (0, _common.Redirect)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _verifyemailapi.VerifyEmailQueryDto === "undefined" ? Object : _verifyemailapi.VerifyEmailQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], VerifyEmailController.prototype, "verifyEmail", null);
VerifyEmailController = _ts_decorate([
    (0, _common.Controller)("auth"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus,
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], VerifyEmailController);

//# sourceMappingURL=verify-email.controller.js.map