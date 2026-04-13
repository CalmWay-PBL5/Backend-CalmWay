"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetKycListQuery", {
    enumerable: true,
    get: function() {
        return GetKycListQuery;
    }
});
let GetKycListQuery = class GetKycListQuery {
    constructor(page = 1, limit = 10, status){
        this.page = page;
        this.limit = limit;
        this.status = status;
    }
};

//# sourceMappingURL=get-kyc-list.query.js.map