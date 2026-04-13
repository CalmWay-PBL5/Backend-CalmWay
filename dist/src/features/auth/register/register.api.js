"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get RegisterRequestDto () {
        return RegisterRequestDto;
    },
    get RegisterResponseDto () {
        return RegisterResponseDto;
    }
});
const _client = require("@prisma/client");
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RegisterRequestDto = class RegisterRequestDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: "Email là bắt buộc"
    }),
    (0, _classvalidator.IsEmail)({}, {
        message: "Email không hợp lệ"
    }),
    _ts_metadata("design:type", String)
], RegisterRequestDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)({
        message: "Họ và tên là bắt buộc"
    }),
    _ts_metadata("design:type", String)
], RegisterRequestDto.prototype, "fullName", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự"
    }),
    _ts_metadata("design:type", String)
], RegisterRequestDto.prototype, "password", void 0);
_ts_decorate([
    (0, _classvalidator.IsIn)([
        _client.Role.STUDENT,
        _client.Role.LECTURER
    ], {
        message: "role chỉ được là STUDENT hoặc LECTURER"
    }),
    (0, _classtransformer.Transform)(({ value })=>typeof value === "string" ? value.trim().toUpperCase() : value),
    _ts_metadata("design:type", typeof _client.Role === "undefined" ? Object : _client.Role)
], RegisterRequestDto.prototype, "role", void 0);
let RegisterResponseDto = class RegisterResponseDto {
};

//# sourceMappingURL=register.api.js.map