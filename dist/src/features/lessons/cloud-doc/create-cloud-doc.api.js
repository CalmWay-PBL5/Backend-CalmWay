"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCloudDocDto", {
    enumerable: true,
    get: function() {
        return CreateCloudDocDto;
    }
});
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
let CreateCloudDocDto = class CreateCloudDocDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: "Tiêu đề không được để trống."
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(255),
    _ts_metadata("design:type", String)
], CreateCloudDocDto.prototype, "title", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: "Link tài liệu không được để trống."
    }),
    (0, _classvalidator.IsUrl)({}, {
        message: "Link tài liệu phải là URL hợp lệ."
    }),
    _ts_metadata("design:type", String)
], CreateCloudDocDto.prototype, "url", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: "ID lớp học không được để trống."
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCloudDocDto.prototype, "classId", void 0);

//# sourceMappingURL=create-cloud-doc.api.js.map