"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ExportMyTeacherCourseStudentsHandler", {
    enumerable: true,
    get: function() {
        return ExportMyTeacherCourseStudentsHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _exportmyteachercoursestudentsquery = require("./export-my-teacher-course-students.query");
const _studentsexportutil = require("./students-export.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ExportMyTeacherCourseStudentsHandler = class ExportMyTeacherCourseStudentsHandler {
    async execute(query) {
        const course = await this.prisma.course.findFirst({
            where: {
                id: query.courseId,
                instructorId: query.teacherId
            },
            select: {
                id: true,
                title: true
            }
        });
        if (!course) {
            throw new _common.BadRequestException("Không tìm thấy khóa học hoặc khóa học không thuộc về bạn.");
        }
        const purchases = await this.prisma.courseTransaction.findMany({
            where: {
                courseId: query.courseId,
                status: _client.TransactionStatus.SUCCESS
            },
            distinct: [
                "studentId"
            ],
            orderBy: {
                createdAt: "asc"
            },
            select: {
                createdAt: true,
                amount: true,
                student: {
                    select: {
                        email: true,
                        profile: {
                            select: {
                                full_name: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });
        const rows = [
            [
                "STT",
                "Email",
                "Ho ten",
                "So dien thoai",
                "So tien",
                "Ngay mua"
            ]
        ];
        purchases.forEach((purchase, idx)=>{
            rows.push([
                idx + 1,
                purchase.student.email,
                purchase.student.profile?.full_name || "",
                purchase.student.profile?.phone || "",
                purchase.amount,
                purchase.createdAt.toISOString()
            ]);
        });
        return {
            fileName: `course-${course.id}-students-${Date.now()}.csv`,
            csv: (0, _studentsexportutil.toCsv)(rows)
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ExportMyTeacherCourseStudentsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_exportmyteachercoursestudentsquery.ExportMyTeacherCourseStudentsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ExportMyTeacherCourseStudentsHandler);

//# sourceMappingURL=export-my-teacher-course-students.handler.js.map