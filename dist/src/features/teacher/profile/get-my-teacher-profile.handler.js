"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyTeacherProfileHandler", {
    enumerable: true,
    get: function() {
        return GetMyTeacherProfileHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getmyteacherprofilequery = require("./get-my-teacher-profile.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyTeacherProfileHandler = class GetMyTeacherProfileHandler {
    async execute(query) {
        const teacher = await this.prisma.user.findUnique({
            where: {
                id: query.teacherId
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                is_verified: true,
                isActive: true,
                banReason: true,
                created_at: true,
                updated_at: true,
                profile: {
                    select: {
                        id: true,
                        full_name: true,
                        phone: true,
                        avatar: true,
                        bio: true,
                        identify_card_url: true,
                        updated_at: true
                    }
                },
                kycApplication: {
                    select: {
                        id: true,
                        status: true,
                        identityCardUrl: true,
                        supportingDocumentUrls: true,
                        rejectionReason: true,
                        createdAt: true,
                        updatedAt: true
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
        const identifyCardUrl = teacher.kycApplication?.identityCardUrl ?? teacher.profile?.identify_card_url ?? null;
        return {
            id: teacher.id,
            email: teacher.email,
            role: teacher.role,
            status: teacher.status,
            isVerified: teacher.is_verified,
            isActive: teacher.isActive,
            banReason: teacher.banReason,
            createdAt: teacher.created_at,
            updatedAt: teacher.updated_at,
            profile: teacher.profile ? {
                id: teacher.profile.id,
                fullName: teacher.profile.full_name,
                phone: teacher.profile.phone,
                avatar: teacher.profile.avatar,
                bio: teacher.profile.bio,
                identifyCardUrl,
                updatedAt: teacher.profile.updated_at
            } : null,
            kyc: teacher.kycApplication ? {
                id: teacher.kycApplication.id,
                status: teacher.kycApplication.status,
                identityCardUrl: teacher.kycApplication.identityCardUrl,
                supportingDocumentUrls: this.toUrlList(teacher.kycApplication.supportingDocumentUrls),
                rejectionReason: teacher.kycApplication.rejectionReason,
                createdAt: teacher.kycApplication.createdAt,
                updatedAt: teacher.kycApplication.updatedAt
            } : null
        };
    }
    toUrlList(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item)=>typeof item === "string");
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetMyTeacherProfileHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmyteacherprofilequery.GetMyTeacherProfileQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetMyTeacherProfileHandler);

//# sourceMappingURL=get-my-teacher-profile.handler.js.map