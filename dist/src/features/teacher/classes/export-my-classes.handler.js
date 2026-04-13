"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ExportMyClassesHandler", {
    enumerable: true,
    get: function() {
        return ExportMyClassesHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _exportmyclassesquery = require("./export-my-classes.query");
const _classexportutil = require("./class-export.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ExportMyClassesHandler = class ExportMyClassesHandler {
    async execute(query) {
        const classes = await this.prisma.class.findMany({
            where: {
                teacher_id: query.teacherId,
                status: _client.ClassStatus.ACTIVE
            },
            include: {
                subject: {
                    select: {
                        name: true
                    }
                },
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
            },
            orderBy: {
                created_at: "desc"
            }
        });
        const rows = [
            [
                "STT",
                "Ten lop hoc",
                "Ma lop",
                "Mon hoc",
                "Mo ta",
                "Gia tien",
                "So hoc sinh",
                "Loai lop",
                "Ngay tao"
            ]
        ];
        classes.forEach((classItem, idx)=>{
            const studentCount = classItem.classMembers.length ? new Set(classItem.classMembers.map((item)=>item.student_id)).size : new Set(classItem.transactions.map((item)=>item.user_id)).size;
            rows.push([
                idx + 1,
                classItem.title,
                classItem.class_code,
                classItem.subject?.name || "",
                classItem.description || "",
                Number(classItem.price || 0),
                studentCount,
                classItem.type,
                classItem.created_at.toISOString()
            ]);
        });
        return {
            fileName: `teacher-classes-${Date.now()}.csv`,
            csv: (0, _classexportutil.toCsv)(rows)
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ExportMyClassesHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_exportmyclassesquery.ExportMyClassesQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ExportMyClassesHandler);

//# sourceMappingURL=export-my-classes.handler.js.map