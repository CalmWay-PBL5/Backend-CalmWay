"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FinanceAdminController", {
    enumerable: true,
    get: function() {
        return FinanceAdminController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _reviewpayoutapi = require("./payouts/review-payout.api");
const _reviewpayoutcommand = require("./payouts/review-payout.command");
const _getrevenuedashboardquery = require("./dashboard/get-revenue-dashboard.query");
const _listtransactionsapi = require("./transactions/list-transactions.api");
const _listtransactionsquery = require("./transactions/list-transactions.query");
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
let FinanceAdminController = class FinanceAdminController {
    async getDashboard(startDateStr, endDateStr) {
        const endDate = endDateStr ? this.parseDateOrThrow(endDateStr, "endDate") : new Date();
        const startDate = startDateStr ? this.parseDateOrThrow(startDateStr, "startDate") : this.getDefaultStartDate(endDate);
        return await this.queryBus.execute(new _getrevenuedashboardquery.GetRevenueDashboardQuery(startDate, endDate));
    }
    async listTransactions(query) {
        const startDate = query.startDate ? this.parseDateOrThrow(query.startDate, "startDate") : undefined;
        const endDate = query.endDate ? this.parseDateOrThrow(query.endDate, "endDate", {
            endOfDay: true
        }) : undefined;
        if (startDate && endDate && startDate > endDate) {
            throw new _common.BadRequestException("startDate không được lớn hơn endDate.");
        }
        const status = this.normalizeStatus(query.status);
        const keyword = query.q?.trim();
        return await this.queryBus.execute(new _listtransactionsquery.ListFinanceTransactionsQuery(keyword || undefined, status, query.page, query.limit, startDate, endDate));
    }
    async reviewPayout(payoutId, dto, req) {
        return await this.commandBus.execute(new _reviewpayoutcommand.ReviewPayoutCommand(payoutId, req.user.id, dto));
    }
    getDefaultStartDate(endDate) {
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        return startDate;
    }
    parseDateOrThrow(rawDate, field, options) {
        const trimmed = rawDate.trim();
        let parsedDate;
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            parsedDate = new Date(`${trimmed}T00:00:00.000Z`);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
            const [day, month, year] = trimmed.split("/");
            parsedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        } else {
            parsedDate = new Date(trimmed);
        }
        if (Number.isNaN(parsedDate.getTime())) {
            throw new _common.BadRequestException(`Giá trị ${field} không hợp lệ.`);
        }
        if (options?.endOfDay) {
            parsedDate.setUTCHours(23, 59, 59, 999);
        }
        return parsedDate;
    }
    normalizeStatus(rawStatus) {
        if (!rawStatus) {
            return undefined;
        }
        const normalized = rawStatus.trim().toUpperCase();
        if (!normalized || normalized === "ALL") {
            return undefined;
        }
        if (!(normalized in _client.TransactionStatus)) {
            throw new _common.BadRequestException("Giá trị status không hợp lệ.");
        }
        return normalized;
    }
    constructor(commandBus, queryBus){
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
};
_ts_decorate([
    (0, _common.Get)("dashboard"),
    _ts_param(0, (0, _common.Query)("startDate")),
    _ts_param(1, (0, _common.Query)("endDate")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], FinanceAdminController.prototype, "getDashboard", null);
_ts_decorate([
    (0, _common.Get)("transactions"),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _listtransactionsapi.ListFinanceTransactionsDto === "undefined" ? Object : _listtransactionsapi.ListFinanceTransactionsDto
    ]),
    _ts_metadata("design:returntype", Promise)
], FinanceAdminController.prototype, "listTransactions", null);
_ts_decorate([
    (0, _common.Patch)("payouts/:id/review"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _reviewpayoutapi.ReviewPayoutDto === "undefined" ? Object : _reviewpayoutapi.ReviewPayoutDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FinanceAdminController.prototype, "reviewPayout", null);
FinanceAdminController = _ts_decorate([
    (0, _common.Controller)("admin/finance"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.ADMIN),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus,
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus
    ])
], FinanceAdminController);

//# sourceMappingURL=finance-admin.controller.js.map