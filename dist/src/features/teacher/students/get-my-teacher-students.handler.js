"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyTeacherStudentsHandler", {
    enumerable: true,
    get: function() {
        return GetMyTeacherStudentsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getmyteacherstudentsquery = require("./get-my-teacher-students.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyTeacherStudentsHandler = class GetMyTeacherStudentsHandler {
    async execute(query) {
        const where = {
            role: _client.Role.STUDENT,
            courseTransactions: {
                some: {
                    status: _client.TransactionStatus.SUCCESS,
                    course: {
                        instructorId: query.teacherId
                    }
                }
            }
        };
        const [total, students] = await Promise.all([
            this.prisma.user.count({
                where
            }),
            this.prisma.user.findMany({
                where,
                skip: query.skip,
                take: query.take,
                orderBy: {
                    created_at: "desc"
                },
                select: {
                    id: true,
                    email: true,
                    is_verified: true,
                    created_at: true,
                    profile: {
                        select: {
                            full_name: true,
                            phone: true,
                            avatar: true
                        }
                    },
                    courseTransactions: {
                        where: {
                            status: _client.TransactionStatus.SUCCESS,
                            course: {
                                instructorId: query.teacherId
                            }
                        },
                        select: {
                            amount: true,
                            instructorRevenue: true,
                            courseId: true,
                            createdAt: true,
                            course: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            })
        ]);
        return {
            data: students.map((student)=>{
                const totalSpent = student.courseTransactions.reduce((sum, item)=>sum + item.amount, 0);
                return {
                    id: student.id,
                    email: student.email,
                    isVerified: student.is_verified,
                    createdAt: student.created_at,
                    profile: student.profile ? {
                        fullName: student.profile.full_name,
                        phone: student.profile.phone,
                        avatar: student.profile.avatar
                    } : null,
                    purchasedCoursesCount: student.courseTransactions.length,
                    totalSpent,
                    purchasedCourses: student.courseTransactions.map((tx)=>({
                            courseId: tx.courseId,
                            courseTitle: tx.course.title,
                            paidAmount: tx.amount,
                            instructorRevenue: tx.instructorRevenue,
                            purchasedAt: tx.createdAt
                        }))
                };
            }),
            total,
            skip: query.skip,
            take: query.take
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetMyTeacherStudentsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmyteacherstudentsquery.GetMyTeacherStudentsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetMyTeacherStudentsHandler);

//# sourceMappingURL=get-my-teacher-students.handler.js.map