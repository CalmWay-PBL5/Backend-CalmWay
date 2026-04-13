"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RegisterController", {
    enumerable: true,
    get: function() {
        return RegisterController;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _registerapi = require("./register.api");
const _registercommand = require("./register.command");
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
let RegisterController = class RegisterController {
    async register(request) {
        const userId = await this.commandBus.execute(new _registercommand.RegisterCommand(request.email, request.fullName, request.password, request.role));
        return {
            id: userId,
            email: request.email,
            fullName: request.fullName,
            role: request.role,
            message: request.role === _client.Role.LECTURER ? "Đăng ký giảng viên thành công! Vui lòng xác thực email, đăng nhập và gửi hồ sơ KYC trước khi vào dashboard." : "Đăng ký học viên thành công! Vui lòng kiểm tra email để xác nhận tài khoản."
        };
    }
    constructor(commandBus){
        this.commandBus = commandBus;
    }
};
_ts_decorate([
    (0, _common.UseGuards)(_throttler.ThrottlerGuard),
    (0, _throttler.Throttle)({
        auth: {
            limit: 5,
            ttl: 60000
        }
    }),
    (0, _common.Post)("register"),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerapi.RegisterRequestDto === "undefined" ? Object : _registerapi.RegisterRequestDto
    ]),
    _ts_metadata("design:returntype", Promise)
], RegisterController.prototype, "register", null);
RegisterController = _ts_decorate([
    (0, _common.Controller)("auth"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], RegisterController);

//# sourceMappingURL=register.controller.js.map