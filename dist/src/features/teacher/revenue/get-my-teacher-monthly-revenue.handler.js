"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyTeacherMonthlyRevenueHandler", {
    enumerable: true,
    get: function() {
        return GetMyTeacherMonthlyRevenueHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getmyteachermonthlyrevenuequery = require("./get-my-teacher-monthly-revenue.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyTeacherMonthlyRevenueHandler = class GetMyTeacherMonthlyRevenueHandler {
    async execute(query) {
        const startDate = new Date(Date.UTC(query.year, 0, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(query.year + 1, 0, 1, 0, 0, 0));
        const transactions = await this.prisma.courseTransaction.findMany({
            where: {
                status: _client.TransactionStatus.SUCCESS,
                createdAt: {
                    gte: startDate,
                    lt: endDate
                },
                course: {
                    instructorId: query.teacherId
                }
            },
            select: {
                createdAt: true,
                instructorRevenue: true
            }
        });
        const monthlyData = Array.from({
            length: 12
        }, (_, idx)=>({
                month: idx + 1,
                total: 0
            }));
        for (const tx of transactions){
            const monthIndex = tx.createdAt.getUTCMonth();
            monthlyData[monthIndex].total += tx.instructorRevenue;
        }
        return monthlyData;
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetMyTeacherMonthlyRevenueHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmyteachermonthlyrevenuequery.GetMyTeacherMonthlyRevenueQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetMyTeacherMonthlyRevenueHandler);

//# sourceMappingURL=get-my-teacher-monthly-revenue.handler.js.map