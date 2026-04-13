"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyTeacherRevenueSummaryHandler", {
    enumerable: true,
    get: function() {
        return GetMyTeacherRevenueSummaryHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getmyteacherrevenuesummaryquery = require("./get-my-teacher-revenue-summary.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyTeacherRevenueSummaryHandler = class GetMyTeacherRevenueSummaryHandler {
    async execute(query) {
        const where = {
            status: _client.TransactionStatus.SUCCESS,
            course: {
                instructorId: query.teacherId
            }
        };
        const [transactions, totalCourses] = await Promise.all([
            this.prisma.courseTransaction.findMany({
                where,
                select: {
                    studentId: true,
                    courseId: true,
                    instructorRevenue: true,
                    course: {
                        select: {
                            title: true
                        }
                    }
                }
            }),
            this.prisma.course.count({
                where: {
                    instructorId: query.teacherId,
                    status: _client.CourseStatus.APPROVED
                }
            })
        ]);
        let totalRevenue = 0;
        const totalStudentsSet = new Set();
        const byCourse = new Map();
        for (const transaction of transactions){
            totalRevenue += transaction.instructorRevenue;
            totalStudentsSet.add(transaction.studentId);
            const existing = byCourse.get(transaction.courseId);
            if (!existing) {
                byCourse.set(transaction.courseId, {
                    courseId: transaction.courseId,
                    courseTitle: transaction.course.title,
                    revenue: transaction.instructorRevenue,
                    studentIds: new Set([
                        transaction.studentId
                    ])
                });
                continue;
            }
            existing.revenue += transaction.instructorRevenue;
            existing.studentIds.add(transaction.studentId);
        }
        const revenueByCourse = Array.from(byCourse.values()).map((item)=>({
                courseId: item.courseId,
                courseTitle: item.courseTitle,
                studentCount: item.studentIds.size,
                revenue: item.revenue
            })).sort((a, b)=>b.revenue - a.revenue);
        return {
            totalRevenue,
            totalCourses,
            totalStudents: totalStudentsSet.size,
            totalOrders: transactions.length,
            revenueByCourse
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetMyTeacherRevenueSummaryHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmyteacherrevenuesummaryquery.GetMyTeacherRevenueSummaryQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetMyTeacherRevenueSummaryHandler);

//# sourceMappingURL=get-my-teacher-revenue-summary.handler.js.map