"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ExportMyTeacherStudentsHandler", {
    enumerable: true,
    get: function() {
        return ExportMyTeacherStudentsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _exportmyteacherstudentsquery = require("./export-my-teacher-students.query");
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
let ExportMyTeacherStudentsHandler = class ExportMyTeacherStudentsHandler {
    async execute(query) {
        const students = await this.prisma.user.findMany({
            where: {
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
            orderBy: {
                created_at: "desc"
            },
            select: {
                email: true,
                created_at: true,
                profile: {
                    select: {
                        full_name: true,
                        phone: true
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
                        course: {
                            select: {
                                title: true
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
                "So khoa hoc da mua",
                "Tong chi tieu",
                "Danh sach khoa hoc",
                "Ngay tham gia"
            ]
        ];
        students.forEach((student, idx)=>{
            rows.push([
                idx + 1,
                student.email,
                student.profile?.full_name || "",
                student.profile?.phone || "",
                student.courseTransactions.length,
                student.courseTransactions.reduce((sum, item)=>sum + item.amount, 0),
                student.courseTransactions.map((item)=>item.course.title).join(" | "),
                student.created_at.toISOString()
            ]);
        });
        return {
            fileName: `teacher-students-${Date.now()}.csv`,
            csv: (0, _studentsexportutil.toCsv)(rows)
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ExportMyTeacherStudentsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_exportmyteacherstudentsquery.ExportMyTeacherStudentsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ExportMyTeacherStudentsHandler);

//# sourceMappingURL=export-my-teacher-students.handler.js.map