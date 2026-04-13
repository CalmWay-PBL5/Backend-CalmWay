"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyTeacherStudentStatsHandler", {
    enumerable: true,
    get: function() {
        return GetMyTeacherStudentStatsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getmyteacherstudentstatsquery = require("./get-my-teacher-student-stats.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyTeacherStudentStatsHandler = class GetMyTeacherStudentStatsHandler {
    async execute(query) {
        const transactionWhere = {
            status: _client.TransactionStatus.SUCCESS,
            course: {
                instructorId: query.teacherId
            }
        };
        const studentWhere = {
            role: _client.Role.STUDENT,
            courseTransactions: {
                some: transactionWhere
            }
        };
        const [totalStudents, totalOrders, totalRevenueAgg, studentCoursePairs] = await Promise.all([
            this.prisma.user.count({
                where: studentWhere
            }),
            this.prisma.courseTransaction.count({
                where: transactionWhere
            }),
            this.prisma.courseTransaction.aggregate({
                where: transactionWhere,
                _sum: {
                    instructorRevenue: true
                }
            }),
            this.prisma.courseTransaction.findMany({
                where: transactionWhere,
                select: {
                    studentId: true,
                    courseId: true
                },
                distinct: [
                    "studentId",
                    "courseId"
                ]
            })
        ]);
        const uniqueCourseCountByStudent = new Map();
        for (const pair of studentCoursePairs){
            uniqueCourseCountByStudent.set(pair.studentId, (uniqueCourseCountByStudent.get(pair.studentId) || 0) + 1);
        }
        const repeatStudents = Array.from(uniqueCourseCountByStudent.values()).filter((count)=>count >= 2).length;
        return {
            totalStudents,
            totalOrders,
            totalRevenue: totalRevenueAgg._sum.instructorRevenue || 0,
            repeatStudents
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetMyTeacherStudentStatsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmyteacherstudentstatsquery.GetMyTeacherStudentStatsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetMyTeacherStudentStatsHandler);

//# sourceMappingURL=get-my-teacher-student-stats.handler.js.map