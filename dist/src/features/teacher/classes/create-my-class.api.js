"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateMyClassDto", {
    enumerable: true,
    get: function() {
        return CreateMyClassDto;
    }
});
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateMyClassDto = class CreateMyClassDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)({
        message: "Tên lớp học không được để trống."
    }),
    _ts_metadata("design:type", String)
], CreateMyClassDto.prototype, "title", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateMyClassDto.prototype, "description", void 0);
_ts_decorate([
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0, {
        message: "Giá tiền không được nhỏ hơn 0."
    }),
    _ts_metadata("design:type", Number)
], CreateMyClassDto.prototype, "price", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_client.ClassType, {
        message: "Chế độ lớp học chỉ được là PUBLIC hoặc PRIVATE."
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof _client.ClassType === "undefined" ? Object : _client.ClassType)
], CreateMyClassDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1, {
        message: "Sĩ số tối đa phải lớn hơn 0."
    }),
    (0, _classvalidator.Max)(5000, {
        message: "Sĩ số tối đa không hợp lệ."
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreateMyClassDto.prototype, "maxStudents", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateMyClassDto.prototype, "subjectId", void 0);

//# sourceMappingURL=create-my-class.api.js.map