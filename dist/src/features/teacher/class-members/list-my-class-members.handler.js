"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ListMyClassMembersHandler", {
    enumerable: true,
    get: function() {
        return ListMyClassMembersHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _listmyclassmembersquery = require("./list-my-class-members.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ListMyClassMembersHandler = class ListMyClassMembersHandler {
    async execute(query) {
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: query.classId,
                teacher_id: query.teacherId
            },
            select: {
                id: true,
                title: true,
                status: true
            }
        });
        if (!classItem) {
            throw new _common.NotFoundException("Lớp học không tồn tại hoặc không thuộc về bạn.");
        }
        const members = await this.prisma.classMember.findMany({
            where: {
                class_id: query.classId,
                ...query.status ? {
                    status: query.status
                } : {}
            },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        is_verified: true,
                        isActive: true,
                        created_at: true,
                        profile: {
                            select: {
                                full_name: true,
                                avatar: true,
                                phone: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                joined_at: "desc"
            }
        });
        const activeCount = members.filter((item)=>item.status === "ACTIVE").length;
        return {
            class: {
                id: classItem.id,
                title: classItem.title,
                status: classItem.status
            },
            total: members.length,
            activeCount,
            droppedCount: members.length - activeCount,
            data: members.map((member)=>({
                    id: member.id,
                    classId: member.class_id,
                    studentId: member.student_id,
                    status: member.status,
                    joinedAt: member.joined_at,
                    droppedAt: member.dropped_at,
                    student: {
                        id: member.student.id,
                        email: member.student.email,
                        isVerified: member.student.is_verified,
                        isActive: member.student.isActive,
                        createdAt: member.student.created_at,
                        fullName: member.student.profile?.full_name || null,
                        avatar: member.student.profile?.avatar || null,
                        phone: member.student.profile?.phone || null
                    }
                }))
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ListMyClassMembersHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_listmyclassmembersquery.ListMyClassMembersQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ListMyClassMembersHandler);

//# sourceMappingURL=list-my-class-members.handler.js.map