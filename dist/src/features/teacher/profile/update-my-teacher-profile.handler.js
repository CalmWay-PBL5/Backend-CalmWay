"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateMyTeacherProfileHandler", {
    enumerable: true,
    get: function() {
        return UpdateMyTeacherProfileHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _s3storageservice = require("../../../infrastructure/storage/s3-storage.service");
const _updatemyteacherprofilecommand = require("./update-my-teacher-profile.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UpdateMyTeacherProfileHandler = class UpdateMyTeacherProfileHandler {
    async execute(command) {
        const { teacherId, dto, avatarFile } = command;
        const teacher = await this.prisma.user.findUnique({
            where: {
                id: teacherId
            },
            select: {
                id: true,
                email: true,
                role: true,
                profile: {
                    select: {
                        full_name: true
                    }
                }
            }
        });
        if (!teacher) {
            throw new _common.NotFoundException("Không tìm thấy tài khoản giảng viên.");
        }
        if (teacher.role !== _client.Role.LECTURER) {
            throw new _common.ForbiddenException("Tài khoản này không phải giảng viên.");
        }
        const normalized = {
            fullName: this.toOptionalText(dto.fullName),
            phone: this.toOptionalText(dto.phone),
            bio: this.toOptionalText(dto.bio)
        };
        const avatarUrl = avatarFile ? await this.storage.uploadFile(avatarFile, "profiles/avatars") : undefined;
        const fullNameForCreate = normalized.fullName || teacher.profile?.full_name || this.defaultNameFromEmail(teacher.email);
        const profile = await this.prisma.profile.upsert({
            where: {
                user_id: teacherId
            },
            update: {
                full_name: normalized.fullName,
                phone: normalized.phone,
                bio: normalized.bio,
                avatar: avatarUrl
            },
            create: {
                user_id: teacherId,
                full_name: fullNameForCreate,
                phone: normalized.phone,
                bio: normalized.bio,
                avatar: avatarUrl
            },
            select: {
                id: true,
                user_id: true,
                full_name: true,
                phone: true,
                avatar: true,
                bio: true,
                identify_card_url: true,
                updated_at: true
            }
        });
        this.logger.log(`Teacher [${teacherId}] updated own profile.`);
        return {
            id: profile.id,
            userId: profile.user_id,
            fullName: profile.full_name,
            phone: profile.phone,
            avatar: profile.avatar,
            bio: profile.bio,
            identifyCardUrl: profile.identify_card_url,
            updatedAt: profile.updated_at
        };
    }
    toOptionalText(value) {
        if (typeof value !== "string") {
            return undefined;
        }
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    defaultNameFromEmail(email) {
        const fallback = email.split("@")[0]?.trim();
        return fallback || "Lecturer";
    }
    constructor(prisma, storage){
        this.prisma = prisma;
        this.storage = storage;
        this.logger = new _common.Logger(UpdateMyTeacherProfileHandler.name);
    }
};
UpdateMyTeacherProfileHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_updatemyteacherprofilecommand.UpdateMyTeacherProfileCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _s3storageservice.S3StorageService === "undefined" ? Object : _s3storageservice.S3StorageService
    ])
], UpdateMyTeacherProfileHandler);

//# sourceMappingURL=update-my-teacher-profile.handler.js.map