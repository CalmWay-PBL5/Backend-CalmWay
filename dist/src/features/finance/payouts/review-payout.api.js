"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReviewPayoutDto", {
    enumerable: true,
    get: function() {
        return ReviewPayoutDto;
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
let ReviewPayoutDto = class ReviewPayoutDto {
};
_ts_decorate([
    (0, _classvalidator.IsIn)([
        _client.PayoutStatus.COMPLETED,
        _client.PayoutStatus.REJECTED
    ]),
    _ts_metadata("design:type", typeof _client.PayoutStatus === "undefined" ? Object : _client.PayoutStatus)
], ReviewPayoutDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.ValidateIf)((o)=>o.status === _client.PayoutStatus.COMPLETED),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)({
        message: "Bắt buộc nhập mã giao dịch ngân hàng (TxRef) để đối soát"
    }),
    _ts_metadata("design:type", String)
], ReviewPayoutDto.prototype, "transactionRef", void 0);
_ts_decorate([
    (0, _classvalidator.ValidateIf)((o)=>o.status === _client.PayoutStatus.REJECTED),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)({
        message: "Bắt buộc nhập lý do từ chối"
    }),
    _ts_metadata("design:type", String)
], ReviewPayoutDto.prototype, "reason", void 0);

//# sourceMappingURL=review-payout.api.js.map