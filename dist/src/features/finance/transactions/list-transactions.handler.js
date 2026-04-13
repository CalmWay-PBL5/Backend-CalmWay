"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ListFinanceTransactionsHandler", {
    enumerable: true,
    get: function() {
        return ListFinanceTransactionsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _listtransactionsquery = require("./list-transactions.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ListFinanceTransactionsHandler = class ListFinanceTransactionsHandler {
    async execute(query) {
        const { q, status, page, limit, startDate, endDate } = query;
        const skip = (page - 1) * limit;
        const where = {
            ...status ? {
                status
            } : {},
            ...startDate || endDate ? {
                createdAt: {
                    ...startDate ? {
                        gte: startDate
                    } : {},
                    ...endDate ? {
                        lte: endDate
                    } : {}
                }
            } : {},
            ...q ? {
                OR: [
                    {
                        id: {
                            contains: q,
                            mode: "insensitive"
                        }
                    },
                    {
                        transactionRef: {
                            contains: q,
                            mode: "insensitive"
                        }
                    }
                ]
            } : {}
        };
        const [items, total] = await Promise.all([
            this.prisma.courseTransaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                            instructor: {
                                select: {
                                    id: true,
                                    email: true,
                                    profile: {
                                        select: {
                                            full_name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    student: {
                        select: {
                            id: true,
                            email: true,
                            profile: {
                                select: {
                                    full_name: true
                                }
                            }
                        }
                    }
                }
            }),
            this.prisma.courseTransaction.count({
                where
            })
        ]);
        return {
            items: items.map((tx)=>({
                    id: tx.id,
                    transactionRef: tx.transactionRef,
                    amount: tx.amount,
                    platformFee: tx.platformFee,
                    instructorRevenue: tx.instructorRevenue,
                    status: tx.status,
                    paymentMethod: tx.paymentMethod,
                    createdAt: tx.createdAt,
                    course: {
                        id: tx.course.id,
                        title: tx.course.title
                    },
                    teacher: {
                        id: tx.course.instructor.id,
                        email: tx.course.instructor.email,
                        fullName: tx.course.instructor.profile?.full_name || null
                    },
                    student: {
                        id: tx.student.id,
                        email: tx.student.email,
                        fullName: tx.student.profile?.full_name || null
                    }
                })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ListFinanceTransactionsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_listtransactionsquery.ListFinanceTransactionsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ListFinanceTransactionsHandler);

//# sourceMappingURL=list-transactions.handler.js.map