"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReviewKycDto", {
    enumerable: true,
    get: function() {
        return ReviewKycDto;
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
let ReviewKycDto = class ReviewKycDto {
};
_ts_decorate([
    (0, _classvalidator.IsEnum)(_client.KycStatus),
    _ts_metadata("design:type", typeof _client.KycStatus === "undefined" ? Object : _client.KycStatus)
], ReviewKycDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.ValidateIf)((o)=>o.status === _client.KycStatus.REJECTED),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ReviewKycDto.prototype, "rejectionReason", void 0);

//# sourceMappingURL=review-kyc.api.js.map