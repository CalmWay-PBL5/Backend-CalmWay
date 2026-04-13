"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyTeacherStudentDetailHandler", {
    enumerable: true,
    get: function() {
        return GetMyTeacherStudentDetailHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getmyteacherstudentdetailquery = require("./get-my-teacher-student-detail.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyTeacherStudentDetailHandler = class GetMyTeacherStudentDetailHandler {
    async execute(query) {
        const student = await this.prisma.user.findFirst({
            where: {
                id: query.studentId,
                role: _client.Role.STUDENT,
                courseTransactions: {
                    some: {
                        status: _client.TransactionStatus.SUCCESS,
                        course: {
                            instructorId: query.teacherId
                        }
                    }
                }
            },
            select: {
                id: true,
                email: true,
                is_verified: true,
                created_at: true,
                updated_at: true,
                profile: {
                    select: {
                        full_name: true,
                        phone: true,
                        avatar: true,
                        bio: true
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
                        id: true,
                        amount: true,
                        instructorRevenue: true,
                        paymentMethod: true,
                        transactionRef: true,
                        createdAt: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                thumbnailUrl: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });
        if (!student) {
            throw new _common.ForbiddenException("Học viên này chưa tham gia khóa học nào của bạn.");
        }
        const totalSpent = student.courseTransactions.reduce((sum, item)=>sum + item.amount, 0);
        return {
            id: student.id,
            email: student.email,
            isVerified: student.is_verified,
            createdAt: student.created_at,
            updatedAt: student.updated_at,
            profile: student.profile ? {
                fullName: student.profile.full_name,
                phone: student.profile.phone,
                avatar: student.profile.avatar,
                bio: student.profile.bio
            } : null,
            metrics: {
                purchasedCoursesCount: student.courseTransactions.length,
                totalSpent
            },
            purchaseHistory: student.courseTransactions.map((item)=>({
                    id: item.id,
                    amount: item.amount,
                    instructorRevenue: item.instructorRevenue,
                    paymentMethod: item.paymentMethod,
                    transactionRef: item.transactionRef,
                    purchasedAt: item.createdAt,
                    course: item.course
                }))
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetMyTeacherStudentDetailHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmyteacherstudentdetailquery.GetMyTeacherStudentDetailQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetMyTeacherStudentDetailHandler);

//# sourceMappingURL=get-my-teacher-student-detail.handler.js.map