"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ToggleUserStatusDto", {
    enumerable: true,
    get: function() {
        return ToggleUserStatusDto;
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
let ToggleUserStatusDto = class ToggleUserStatusDto {
};
_ts_decorate([
    (0, _classvalidator.IsBoolean)({
        message: "Trạng thái hoạt động phải là boolean (true/false)"
    }),
    _ts_metadata("design:type", Boolean)
], ToggleUserStatusDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], ToggleUserStatusDto.prototype, "reason", void 0);

//# sourceMappingURL=toggle-status.api.js.map