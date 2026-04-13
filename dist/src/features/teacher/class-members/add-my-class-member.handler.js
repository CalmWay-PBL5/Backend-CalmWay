"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AddMyClassMemberHandler", {
    enumerable: true,
    get: function() {
        return AddMyClassMemberHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _addmyclassmembercommand = require("./add-my-class-member.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AddMyClassMemberHandler = class AddMyClassMemberHandler {
    async execute(command) {
        const { teacherId, dto } = command;
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: dto.classId,
                teacher_id: teacherId,
                status: _client.ClassStatus.ACTIVE
            },
            select: {
                id: true,
                max_students: true
            }
        });
        if (!classItem) {
            throw new _common.NotFoundException("Lớp học không tồn tại hoặc không thuộc về bạn.");
        }
        const student = await this.prisma.user.findUnique({
            where: {
                id: dto.studentId
            },
            select: {
                id: true,
                role: true,
                isActive: true
            }
        });
        if (!student || student.role !== _client.Role.STUDENT) {
            throw new _common.BadRequestException("Không tìm thấy học sinh hợp lệ.");
        }
        if (!student.isActive) {
            throw new _common.BadRequestException("Học sinh đang bị khóa, không thể thêm vào lớp.");
        }
        const [existingMember, activeStudentCount] = await Promise.all([
            this.prisma.classMember.findUnique({
                where: {
                    class_id_student_id: {
                        class_id: dto.classId,
                        student_id: dto.studentId
                    }
                }
            }),
            this.prisma.classMember.count({
                where: {
                    class_id: dto.classId,
                    status: _client.ClassMemberStatus.ACTIVE
                }
            })
        ]);
        if (existingMember?.status === _client.ClassMemberStatus.ACTIVE) {
            throw new _common.BadRequestException("Học sinh này đã tham gia lớp học này rồi.");
        }
        if (activeStudentCount >= classItem.max_students) {
            throw new _common.BadRequestException("Lớp học đã đạt giới hạn sĩ số tối đa, không thể thêm học viên.");
        }
        const member = existingMember ? await this.prisma.classMember.update({
            where: {
                class_id_student_id: {
                    class_id: dto.classId,
                    student_id: dto.studentId
                }
            },
            data: {
                status: _client.ClassMemberStatus.ACTIVE,
                joined_at: new Date(),
                dropped_at: null
            },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                full_name: true,
                                avatar: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        }) : await this.prisma.classMember.create({
            data: {
                class_id: dto.classId,
                student_id: dto.studentId,
                status: _client.ClassMemberStatus.ACTIVE
            },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                full_name: true,
                                avatar: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });
        return {
            id: member.id,
            classId: member.class_id,
            studentId: member.student_id,
            status: member.status,
            joinedAt: member.joined_at,
            droppedAt: member.dropped_at,
            student: {
                id: member.student.id,
                email: member.student.email,
                fullName: member.student.profile?.full_name || null,
                avatar: member.student.profile?.avatar || null,
                phone: member.student.profile?.phone || null
            }
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
AddMyClassMemberHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_addmyclassmembercommand.AddMyClassMemberCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], AddMyClassMemberHandler);

//# sourceMappingURL=add-my-class-member.handler.js.map