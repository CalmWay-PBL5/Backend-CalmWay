"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ExportMyClassMembersHandler", {
    enumerable: true,
    get: function() {
        return ExportMyClassMembersHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _exportmyclassmembersquery = require("./export-my-class-members.query");
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
let ExportMyClassMembersHandler = class ExportMyClassMembersHandler {
    async execute(query) {
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: query.classId,
                teacher_id: query.teacherId,
                status: _client.ClassStatus.ACTIVE
            },
            select: {
                id: true,
                title: true
            }
        });
        if (!classItem) {
            throw new _common.BadRequestException("Lớp học không tồn tại hoặc không thuộc về bạn.");
        }
        const members = await this.prisma.classMember.findMany({
            where: {
                class_id: query.classId,
                status: _client.ClassMemberStatus.ACTIVE
            },
            orderBy: {
                joined_at: "asc"
            },
            select: {
                joined_at: true,
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
        const fallbackMembers = members.length > 0 ? [] : await this.prisma.transaction.findMany({
            where: {
                class_id: query.classId,
                status: _client.TransactionStatus.SUCCESS
            },
            distinct: [
                "user_id"
            ],
            orderBy: {
                created_at: "asc"
            },
            select: {
                created_at: true,
                user: {
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
                "Ho va ten",
                "Email",
                "So dien thoai",
                "Ngay tham gia"
            ]
        ];
        if (members.length) {
            members.forEach((member, idx)=>{
                rows.push([
                    idx + 1,
                    member.student.profile?.full_name || "",
                    member.student.email,
                    member.student.profile?.phone || "",
                    member.joined_at.toISOString()
                ]);
            });
        } else {
            fallbackMembers.forEach((member, idx)=>{
                rows.push([
                    idx + 1,
                    member.user.profile?.full_name || "",
                    member.user.email,
                    member.user.profile?.phone || "",
                    member.created_at.toISOString()
                ]);
            });
        }
        return {
            fileName: `class-${classItem.id}-members-${Date.now()}.csv`,
            csv: (0, _classexportutil.toCsv)(rows)
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ExportMyClassMembersHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_exportmyclassmembersquery.ExportMyClassMembersQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ExportMyClassMembersHandler);

//# sourceMappingURL=export-my-class-members.handler.js.map