"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FinanceModule", {
    enumerable: true,
    get: function() {
        return FinanceModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _financeadmincontroller = require("./finance-admin.controller");
const _reviewpayouthandler = require("./payouts/review-payout.handler");
const _rolesguard = require("../auth/guards/roles.guard");
const _getrevenuedashboardhandler = require("./dashboard/get-revenue-dashboard.handler");
const _listtransactionshandler = require("./transactions/list-transactions.handler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let FinanceModule = class FinanceModule {
};
FinanceModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule
        ],
        controllers: [
            _financeadmincontroller.FinanceAdminController
        ],
        providers: [
            _reviewpayouthandler.ReviewPayoutHandler,
            _getrevenuedashboardhandler.GetRevenueDashboardHandler,
            _listtransactionshandler.ListFinanceTransactionsHandler,
            _rolesguard.RolesGuard
        ]
    })
], FinanceModule);

//# sourceMappingURL=finance.module.js.map