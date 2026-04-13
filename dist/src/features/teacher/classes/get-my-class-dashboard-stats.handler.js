"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyClassDashboardStatsHandler", {
    enumerable: true,
    get: function() {
        return GetMyClassDashboardStatsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getmyclassdashboardstatsquery = require("./get-my-class-dashboard-stats.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyClassDashboardStatsHandler = class GetMyClassDashboardStatsHandler {
    async execute(query) {
        const [classes, reviewStats] = await Promise.all([
            this.prisma.class.findMany({
                where: {
                    teacher_id: query.teacherId,
                    status: _client.ClassStatus.ACTIVE
                },
                select: {
                    id: true,
                    title: true,
                    transactions: {
                        where: {
                            status: _client.TransactionStatus.SUCCESS
                        },
                        select: {
                            user_id: true,
                            amount: true
                        }
                    },
                    classMembers: {
                        where: {
                            status: _client.ClassMemberStatus.ACTIVE
                        },
                        select: {
                            student_id: true
                        }
                    }
                }
            }),
            this.prisma.classReview.aggregate({
                where: {
                    class: {
                        teacher_id: query.teacherId,
                        status: _client.ClassStatus.ACTIVE
                    }
                },
                _avg: {
                    rating: true
                },
                _count: {
                    id: true
                }
            })
        ]);
        const totalClasses = classes.length;
        const studentSet = new Set();
        let totalRevenue = 0;
        let popularClass = null;
        for (const classItem of classes){
            const classStudents = classItem.classMembers.length ? new Set(classItem.classMembers.map((member)=>member.student_id)) : new Set(classItem.transactions.map((item)=>item.user_id));
            for (const transaction of classItem.transactions){
                totalRevenue += Number(transaction.amount || 0);
            }
            for (const studentId of classStudents){
                studentSet.add(studentId);
            }
            if (!popularClass || classStudents.size > popularClass.studentCount) {
                popularClass = {
                    id: classItem.id,
                    title: classItem.title,
                    studentCount: classStudents.size
                };
            }
        }
        const averageRating = reviewStats._count.id > 0 && typeof reviewStats._avg.rating === "number" ? Number(reviewStats._avg.rating.toFixed(1)) : 5;
        return {
            totalClasses,
            totalStudents: studentSet.size,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            averageRating,
            popularClass
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetMyClassDashboardStatsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmyclassdashboardstatsquery.GetMyClassDashboardStatsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetMyClassDashboardStatsHandler);

//# sourceMappingURL=get-my-class-dashboard-stats.handler.js.map