"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateMyClassHandler", {
    enumerable: true,
    get: function() {
        return UpdateMyClassHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _s3storageservice = require("../../../infrastructure/storage/s3-storage.service");
const _classmapper = require("./class.mapper");
const _updatemyclasscommand = require("./update-my-class.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UpdateMyClassHandler = class UpdateMyClassHandler {
    async execute(command) {
        const { teacherId, classId, dto, coverImageFile } = command;
        const existing = await this.prisma.class.findFirst({
            where: {
                id: classId,
                teacher_id: teacherId,
                status: _client.ClassStatus.ACTIVE
            },
            select: {
                id: true
            }
        });
        if (!existing) {
            throw new _common.NotFoundException("Không tìm thấy lớp học để cập nhật.");
        }
        const data = {};
        if (typeof dto.title === "string") {
            const title = dto.title.trim();
            if (!title) {
                throw new _common.BadRequestException("Tên lớp học không được để trống.");
            }
            data.title = title;
        }
        if (typeof dto.description === "string") {
            data.description = this.toOptionalText(dto.description);
        }
        if (typeof dto.price !== "undefined") {
            const price = Number(dto.price);
            if (!Number.isFinite(price) || price < 0) {
                throw new _common.BadRequestException("Giá tiền không hợp lệ.");
            }
            data.price = price;
        }
        if (typeof dto.maxStudents !== "undefined") {
            const maxStudents = Number(dto.maxStudents);
            if (!Number.isInteger(maxStudents) || maxStudents < 1) {
                throw new _common.BadRequestException("Sĩ số tối đa không hợp lệ.");
            }
            data.max_students = maxStudents;
        }
        if (dto.type) {
            if (!Object.values(_client.ClassType).includes(dto.type)) {
                throw new _common.BadRequestException("Chế độ lớp học chỉ được là PUBLIC hoặc PRIVATE.");
            }
            data.type = dto.type;
            data.invitation_token = dto.type === "PRIVATE" ? await this.ensureInvitationToken(classId) : null;
        }
        if (dto.subjectId?.trim()) {
            const subject = await this.prisma.subject.findUnique({
                where: {
                    id: dto.subjectId.trim()
                },
                select: {
                    id: true
                }
            });
            if (!subject) {
                throw new _common.NotFoundException("Không tìm thấy môn học đã chọn.");
            }
            data.subject_id = subject.id;
        }
        if (coverImageFile) {
            data.cover_image = await this.storage.uploadFile(coverImageFile, "classes/covers");
        }
        if (!Object.keys(data).length) {
            const current = await this.prisma.class.findUnique({
                where: {
                    id: classId
                },
                include: {
                    subject: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    transactions: {
                        select: {
                            user_id: true,
                            amount: true,
                            status: true
                        }
                    },
                    classMembers: {
                        select: {
                            student_id: true,
                            status: true,
                            joined_at: true
                        }
                    }
                }
            });
            if (!current) {
                throw new _common.NotFoundException("Không tìm thấy lớp học để cập nhật.");
            }
            return (0, _classmapper.mapClassEntity)(current);
        }
        const updated = await this.prisma.class.update({
            where: {
                id: classId
            },
            data,
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                transactions: {
                    select: {
                        user_id: true,
                        amount: true,
                        status: true
                    }
                },
                classMembers: {
                    select: {
                        student_id: true,
                        status: true,
                        joined_at: true
                    }
                }
            }
        });
        return (0, _classmapper.mapClassEntity)(updated);
    }
    async ensureInvitationToken(classId) {
        const current = await this.prisma.class.findUnique({
            where: {
                id: classId
            },
            select: {
                invitation_token: true
            }
        });
        if (current?.invitation_token) {
            return current.invitation_token;
        }
        for(let attempt = 0; attempt < 8; attempt++){
            const random = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
            const existing = await this.prisma.class.findFirst({
                where: {
                    invitation_token: random
                },
                select: {
                    id: true
                }
            });
            if (!existing) {
                return random;
            }
        }
        throw new _common.BadRequestException("Không thể tạo mã mời lớp học.");
    }
    toOptionalText(value) {
        if (typeof value !== "string") {
            return undefined;
        }
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
    }
    constructor(prisma, storage){
        this.prisma = prisma;
        this.storage = storage;
    }
};
UpdateMyClassHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_updatemyclasscommand.UpdateMyClassCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _s3storageservice.S3StorageService === "undefined" ? Object : _s3storageservice.S3StorageService
    ])
], UpdateMyClassHandler);

//# sourceMappingURL=update-my-class.handler.js.map