"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KycAdminController", {
    enumerable: true,
    get: function() {
        return KycAdminController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _client = require("@prisma/client");
const _getkyclistquery = require("./queries/get-kyc-list.query");
const _getkycstatsquery = require("./queries/get-kyc-stats.query");
const _reviewkyccommand = require("./review-kyc/review-kyc.command");
const _reviewkycapi = require("./review-kyc/review-kyc.api");
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
let KycAdminController = class KycAdminController {
    async getList(page = 1, limit = 10, status) {
        return await this.queryBus.execute(new _getkyclistquery.GetKycListQuery(Number(page), Number(limit), status));
    }
    async getDashboardStats(start, end) {
        return await this.queryBus.execute(new _getkycstatsquery.GetKycStatsQuery(start ? this.parseDateOrThrow(start, "start") : undefined, end ? this.parseDateOrThrow(end, "end") : undefined));
    }
    async review(id, dto, req) {
        return await this.commandBus.execute(new _reviewkyccommand.ReviewKycCommand(id, req.user.id, dto));
    }
    parseDateOrThrow(rawDate, field) {
        const parsedDate = new Date(rawDate);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new _common.BadRequestException(`Giá trị ${field} không hợp lệ.`);
        }
        return parsedDate;
    }
    constructor(queryBus, commandBus){
        this.queryBus = queryBus;
        this.commandBus = commandBus;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)("page")),
    _ts_param(1, (0, _common.Query)("limit")),
    _ts_param(2, (0, _common.Query)("status")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number,
        Number,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], KycAdminController.prototype, "getList", null);
_ts_decorate([
    (0, _common.Get)("stats"),
    _ts_param(0, (0, _common.Query)("start")),
    _ts_param(1, (0, _common.Query)("end")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], KycAdminController.prototype, "getDashboardStats", null);
_ts_decorate([
    (0, _common.Patch)(":id/review"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _reviewkycapi.ReviewKycDto === "undefined" ? Object : _reviewkycapi.ReviewKycDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], KycAdminController.prototype, "review", null);
KycAdminController = _ts_decorate([
    (0, _common.Controller)("admin/kyc"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.ADMIN),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus,
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], KycAdminController);

//# sourceMappingURL=kyc-admin.controller.js.map