"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ResetPasswordController", {
    enumerable: true,
    get: function() {
        return ResetPasswordController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _resetpasswordapi = require("./reset-password.api");
const _resetpasswordcommand = require("./reset-password.command");
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
let ResetPasswordController = class ResetPasswordController {
    async resetPassword(dto) {
        await this.commandBus.execute(new _resetpasswordcommand.ResetPasswordCommand(dto));
        return {
            message: "Password has been successfully reset. You can now log in."
        };
    }
    constructor(commandBus){
        this.commandBus = commandBus;
    }
};
_ts_decorate([
    (0, _common.Post)("reset-password"),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _resetpasswordapi.ResetPasswordDto === "undefined" ? Object : _resetpasswordapi.ResetPasswordDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ResetPasswordController.prototype, "resetPassword", null);
ResetPasswordController = _ts_decorate([
    (0, _common.Controller)("auth"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], ResetPasswordController);

//# sourceMappingURL=reset-password.controller.js.map