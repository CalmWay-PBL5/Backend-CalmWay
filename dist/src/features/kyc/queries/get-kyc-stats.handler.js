"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetKycStatsHandler", {
    enumerable: true,
    get: function() {
        return GetKycStatsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getkycstatsquery = require("./get-kyc-stats.query");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetKycStatsHandler = class GetKycStatsHandler {
    async execute(query) {
        const { startDate, endDate } = query;
        const dateFilter = startDate || endDate ? {
            createdAt: {
                ...startDate && {
                    gte: startDate
                },
                ...endDate && {
                    lte: endDate
                }
            }
        } : {};
        const [total, pending, approved, rejected] = await Promise.all([
            this.prisma.kycApplication.count({
                where: dateFilter
            }),
            this.prisma.kycApplication.count({
                where: {
                    ...dateFilter,
                    status: _client.KycStatus.PENDING
                }
            }),
            this.prisma.kycApplication.count({
                where: {
                    ...dateFilter,
                    status: _client.KycStatus.APPROVED
                }
            }),
            this.prisma.kycApplication.count({
                where: {
                    ...dateFilter,
                    status: _client.KycStatus.REJECTED
                }
            })
        ]);
        return {
            summary: {
                total,
                pending,
                approved,
                rejected,
                approvalRate: total > 0 ? approved / total * 100 : 0
            },
            chartData: {
                labels: [
                    "Đang chờ",
                    "Đã duyệt",
                    "Từ chối"
                ],
                datasets: [
                    pending,
                    approved,
                    rejected
                ]
            }
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetKycStatsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getkycstatsquery.GetKycStatsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetKycStatsHandler);

//# sourceMappingURL=get-kyc-stats.handler.js.map