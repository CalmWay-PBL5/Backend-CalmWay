"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SearchMyTeacherStudentsHandler", {
    enumerable: true,
    get: function() {
        return SearchMyTeacherStudentsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _searchmyteacherstudentsquery = require("./search-my-teacher-students.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SearchMyTeacherStudentsHandler = class SearchMyTeacherStudentsHandler {
    async execute(query) {
        const keyword = query.keyword.trim();
        const where = {
            role: _client.Role.STUDENT,
            courseTransactions: {
                some: {
                    status: _client.TransactionStatus.SUCCESS,
                    course: {
                        instructorId: query.teacherId
                    }
                }
            },
            OR: [
                {
                    email: {
                        contains: keyword,
                        mode: "insensitive"
                    }
                },
                {
                    profile: {
                        is: {
                            full_name: {
                                contains: keyword,
                                mode: "insensitive"
                            }
                        }
                    }
                },
                {
                    profile: {
                        is: {
                            phone: {
                                contains: keyword,
                                mode: "insensitive"
                            }
                        }
                    }
                }
            ]
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
                            courseId: true,
                            course: {
                                select: {
                                    title: true
                                }
                            }
                        }
                    }
                }
            })
        ]);
        return {
            data: students.map((student)=>({
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
                    purchasedCourses: student.courseTransactions.map((item)=>({
                            courseId: item.courseId,
                            courseTitle: item.course.title
                        }))
                })),
            total,
            skip: query.skip,
            take: query.take
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
SearchMyTeacherStudentsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_searchmyteacherstudentsquery.SearchMyTeacherStudentsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], SearchMyTeacherStudentsHandler);

//# sourceMappingURL=search-my-teacher-students.handler.js.map