"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LoginController", {
    enumerable: true,
    get: function() {
        return LoginController;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _cqrs = require("@nestjs/cqrs");
const _loginapi = require("./login.api");
const _logincommand = require("./login.command");
const _customthrottlerguard = require("../../../core/guards/custom-throttler.guard");
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
let LoginController = class LoginController {
    async login(dto) {
        return await this.commandBus.execute(new _logincommand.LoginCommand(dto));
    }
    constructor(commandBus){
        this.commandBus = commandBus;
    }
};
_ts_decorate([
    (0, _common.UseGuards)(_customthrottlerguard.CustomThrottlerGuard),
    (0, _throttler.Throttle)({
        auth: {
            limit: 5,
            ttl: 60000
        }
    }),
    (0, _common.Post)("login"),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _loginapi.LoginDto === "undefined" ? Object : _loginapi.LoginDto
    ]),
    _ts_metadata("design:returntype", Promise)
], LoginController.prototype, "login", null);
LoginController = _ts_decorate([
    (0, _common.Controller)("auth"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], LoginController);

//# sourceMappingURL=login.controller.js.map