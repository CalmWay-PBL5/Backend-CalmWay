"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateMyClassHandler", {
    enumerable: true,
    get: function() {
        return CreateMyClassHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _s3storageservice = require("../../../infrastructure/storage/s3-storage.service");
const _classmapper = require("./class.mapper");
const _createmyclasscommand = require("./create-my-class.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateMyClassHandler = class CreateMyClassHandler {
    async execute(command) {
        const { teacherId, dto, coverImageFile } = command;
        const title = dto.title?.trim();
        if (!title) {
            throw new _common.BadRequestException("Tên lớp học không được để trống.");
        }
        const price = Number(dto.price);
        if (!Number.isFinite(price) || price < 0) {
            throw new _common.BadRequestException("Giá tiền không hợp lệ.");
        }
        const maxStudents = this.normalizeMaxStudents(dto.maxStudents);
        if (dto.type && !Object.values(_client.ClassType).includes(dto.type)) {
            throw new _common.BadRequestException("Chế độ lớp học chỉ được là PUBLIC hoặc PRIVATE.");
        }
        const subject = await this.resolveSubject(dto.subjectId);
        const classCode = await this.generateUniqueClassCode();
        const invitationToken = dto.type === _client.ClassType.PRIVATE ? await this.generateUniqueInviteToken() : null;
        const coverImage = coverImageFile ? await this.storage.uploadFile(coverImageFile, "classes/covers") : undefined;
        const created = await this.prisma.class.create({
            data: {
                teacher_id: teacherId,
                subject_id: subject.id,
                title,
                description: this.toOptionalText(dto.description),
                price,
                cover_image: coverImage,
                class_code: classCode,
                invitation_token: invitationToken,
                max_students: maxStudents,
                type: dto.type || _client.ClassType.PUBLIC
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
        return (0, _classmapper.mapClassEntity)(created);
    }
    async resolveSubject(subjectId) {
        if (subjectId?.trim()) {
            const subject = await this.prisma.subject.findUnique({
                where: {
                    id: subjectId.trim()
                },
                select: {
                    id: true,
                    name: true
                }
            });
            if (!subject) {
                throw new _common.NotFoundException("Không tìm thấy môn học đã chọn.");
            }
            return subject;
        }
        const firstSubject = await this.prisma.subject.findFirst({
            orderBy: {
                created_at: "asc"
            },
            select: {
                id: true,
                name: true
            }
        });
        if (!firstSubject) {
            throw new _common.BadRequestException("Chưa có môn học nào trong hệ thống. Vui lòng tạo môn học trước.");
        }
        return firstSubject;
    }
    async generateUniqueClassCode() {
        for(let attempt = 0; attempt < 8; attempt++){
            const random = Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0");
            const code = `CLASS-${random}`;
            const existing = await this.prisma.class.findUnique({
                where: {
                    class_code: code
                },
                select: {
                    id: true
                }
            });
            if (!existing) {
                return code;
            }
        }
        throw new _common.InternalServerErrorException("Không thể tạo mã lớp học duy nhất.");
    }
    async generateUniqueInviteToken() {
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
        throw new _common.InternalServerErrorException("Không thể tạo mã mời lớp học duy nhất.");
    }
    toOptionalText(value) {
        if (typeof value !== "string") {
            return undefined;
        }
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    normalizeMaxStudents(value) {
        if (typeof value === "undefined") {
            return 50;
        }
        const maxStudents = Number(value);
        if (!Number.isInteger(maxStudents) || maxStudents < 1) {
            throw new _common.BadRequestException("Sĩ số tối đa không hợp lệ.");
        }
        return maxStudents;
    }
    constructor(prisma, storage){
        this.prisma = prisma;
        this.storage = storage;
    }
};
CreateMyClassHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_createmyclasscommand.CreateMyClassCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _s3storageservice.S3StorageService === "undefined" ? Object : _s3storageservice.S3StorageService
    ])
], CreateMyClassHandler);

//# sourceMappingURL=create-my-class.handler.js.map