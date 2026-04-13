"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetRevenueDashboardHandler", {
    enumerable: true,
    get: function() {
        return GetRevenueDashboardHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _client = require("@prisma/client");
const _getrevenuedashboardquery = require("./get-revenue-dashboard.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetRevenueDashboardHandler = class GetRevenueDashboardHandler {
    async execute(query) {
        const { startDate, endDate } = query;
        const dateAndSuccessFilter = {
            status: _client.TransactionStatus.SUCCESS,
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        };
        const [transactionStats, payoutStats, totalWallets] = await Promise.all([
            this.prisma.courseTransaction.aggregate({
                where: dateAndSuccessFilter,
                _sum: {
                    amount: true,
                    platformFee: true,
                    instructorRevenue: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.payoutRequest.aggregate({
                where: {
                    status: _client.PayoutStatus.COMPLETED,
                    updatedAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            }),
            this.prisma.wallet.aggregate({
                _sum: {
                    balance: true,
                    lockedBalance: true
                }
            })
        ]);
        const chartRawData = await this.prisma.courseTransaction.groupBy({
            by: [
                "createdAt"
            ],
            where: dateAndSuccessFilter,
            _sum: {
                amount: true,
                platformFee: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        const chartData = this.aggregateByDay(chartRawData);
        return {
            kpis: {
                totalGrossRevenue: transactionStats._sum.amount || 0,
                netPlatformProfit: transactionStats._sum.platformFee || 0,
                instructorEarnings: transactionStats._sum.instructorRevenue || 0,
                totalOrders: transactionStats._count.id || 0,
                totalPayoutsCompleted: payoutStats._sum.amount || 0,
                platformLiability: (totalWallets._sum.balance || 0) + (totalWallets._sum.lockedBalance || 0)
            },
            chartData
        };
    }
    aggregateByDay(data) {
        const result = {};
        for (const row of data){
            const dateStr = row.createdAt.toISOString().split("T")[0];
            if (!result[dateStr]) {
                result[dateStr] = {
                    date: dateStr,
                    revenue: 0,
                    profit: 0
                };
            }
            result[dateStr].revenue += row._sum.amount || 0;
            result[dateStr].profit += row._sum.platformFee || 0;
        }
        return Object.values(result).sort((a, b)=>a.date.localeCompare(b.date));
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetRevenueDashboardHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getrevenuedashboardquery.GetRevenueDashboardQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetRevenueDashboardHandler);

//# sourceMappingURL=get-revenue-dashboard.handler.js.map