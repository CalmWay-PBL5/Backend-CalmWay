"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeacherRevenueController", {
    enumerable: true,
    get: function() {
        return TeacherRevenueController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _getmyteacherrevenuesummaryquery = require("./revenue/get-my-teacher-revenue-summary.query");
const _getmyteachermonthlyrevenueapi = require("./revenue/get-my-teacher-monthly-revenue.api");
const _getmyteachermonthlyrevenuequery = require("./revenue/get-my-teacher-monthly-revenue.query");
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
let TeacherRevenueController = class TeacherRevenueController {
    async getSummary(req) {
        return await this.queryBus.execute(new _getmyteacherrevenuesummaryquery.GetMyTeacherRevenueSummaryQuery(req.user.id));
    }
    async getMonthly(req, query) {
        const year = query.year || new Date().getUTCFullYear();
        return await this.queryBus.execute(new _getmyteachermonthlyrevenuequery.GetMyTeacherMonthlyRevenueQuery(req.user.id, year));
    }
    constructor(queryBus){
        this.queryBus = queryBus;
    }
};
_ts_decorate([
    (0, _common.Get)("summary"),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherRevenueController.prototype, "getSummary", null);
_ts_decorate([
    (0, _common.Get)("monthly"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _getmyteachermonthlyrevenueapi.GetMyTeacherMonthlyRevenueDto === "undefined" ? Object : _getmyteachermonthlyrevenueapi.GetMyTeacherMonthlyRevenueDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherRevenueController.prototype, "getMonthly", null);
TeacherRevenueController = _ts_decorate([
    (0, _common.Controller)("teachers/me/revenue"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.LECTURER),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus
    ])
], TeacherRevenueController);

//# sourceMappingURL=teacher-revenue.controller.js.map