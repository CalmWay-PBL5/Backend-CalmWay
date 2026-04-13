"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReviewCourseDto", {
    enumerable: true,
    get: function() {
        return ReviewCourseDto;
    }
});
const _client = require("@prisma/client");
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
let ReviewCourseDto = class ReviewCourseDto {
};
_ts_decorate([
    (0, _classvalidator.IsIn)([
        _client.CourseStatus.APPROVED,
        _client.CourseStatus.REJECTED
    ], {
        message: "Trạng thái duyệt chỉ được là APPROVED hoặc REJECTED"
    }),
    _ts_metadata("design:type", typeof _client.CourseStatus === "undefined" ? Object : _client.CourseStatus)
], ReviewCourseDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.ValidateIf)((o)=>o.status === _client.CourseStatus.REJECTED),
    (0, _classvalidator.IsString)({
        message: "Bắt buộc nhập lý do từ chối"
    }),
    _ts_metadata("design:type", String)
], ReviewCourseDto.prototype, "reason", void 0);

//# sourceMappingURL=review-course.api.js.map