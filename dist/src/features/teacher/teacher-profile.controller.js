"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeacherProfileController", {
    enumerable: true,
    get: function() {
        return TeacherProfileController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _enterprisefilepipe = require("../../shared/file-upload/enterprise-file.pipe");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _getmyteacherprofilequery = require("./profile/get-my-teacher-profile.query");
const _updatemyteacherprofilecommand = require("./profile/update-my-teacher-profile.command");
const _updatemyteacherprofileapi = require("./profile/update-my-teacher-profile.api");
const _submitkychandler = require("../kyc/submit/submit-kyc.handler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let TeacherProfileController = class TeacherProfileController {
    async getMyProfile(req) {
        return await this.queryBus.execute(new _getmyteacherprofilequery.GetMyTeacherProfileQuery(req.user.id));
    }
    async updateMyProfile(req, dto) {
        const payload = await this.extractPayload(req, dto);
        let kycApplication;
        const hasKycUpload = Boolean(payload.identityCardFile) || payload.degreeFiles.length > 0;
        if (hasKycUpload) {
            if (!payload.identityCardFile || !payload.degreeFiles.length) {
                throw new _common.BadRequestException("Khi cập nhật hồ sơ KYC, cần gửi cả 1 file CCCD/CMND và ít nhất 1 file bằng cấp/chứng chỉ.");
            }
            kycApplication = await this.commandBus.execute(new _submitkychandler.SubmitKycCommand(req.user.id, payload.identityCardFile, payload.degreeFiles));
        }
        const profile = await this.commandBus.execute(new _updatemyteacherprofilecommand.UpdateMyTeacherProfileCommand(req.user.id, payload.dto, payload.avatarFile));
        return {
            profile,
            kycApplication
        };
    }
    async extractPayload(req, dto) {
        const isMultipart = typeof req.isMultipart === "function" ? req.isMultipart() : false;
        if (!isMultipart) {
            return {
                dto,
                avatarFile: undefined,
                identityCardFile: undefined,
                degreeFiles: []
            };
        }
        const iterator = req.parts?.();
        if (!iterator) {
            throw new _common.BadRequestException("Yêu cầu upload không hợp lệ.");
        }
        const parsedDto = {};
        let avatarFile;
        let identityCardFile;
        const degreeFiles = [];
        for await (const part of iterator){
            if (part.type === "field") {
                const fieldName = String(part.fieldname ?? "").trim();
                const value = this.toOptionalText(part.value);
                if (fieldName === "fullName") {
                    parsedDto.fullName = value;
                    continue;
                }
                if (fieldName === "phone") {
                    parsedDto.phone = value;
                    continue;
                }
                if (fieldName === "bio") {
                    parsedDto.bio = value;
                }
                continue;
            }
            if (part.type !== "file") {
                continue;
            }
            const fieldName = String(part.fieldname ?? "").trim();
            const buffer = await part.toBuffer();
            const file = this.toExpressFile(part, buffer);
            if (this.avatarFieldNames.has(fieldName)) {
                if (avatarFile) {
                    throw new _common.BadRequestException("Chỉ được gửi tối đa 1 ảnh đại diện.");
                }
                avatarFile = this.avatarPipe.transform(file);
                continue;
            }
            if (this.identityFieldNames.has(fieldName)) {
                if (identityCardFile) {
                    throw new _common.BadRequestException("Chỉ được gửi tối đa 1 file CCCD/CMND.");
                }
                identityCardFile = this.kycFilePipe.transform(file);
                continue;
            }
            if (this.degreeFieldNames.has(fieldName)) {
                degreeFiles.push(this.kycFilePipe.transform(file));
                continue;
            }
        }
        if (degreeFiles.length > TeacherProfileController.MAX_DEGREE_FILES) {
            throw new _common.BadRequestException(`Số lượng bằng cấp/chứng chỉ tối đa là ${TeacherProfileController.MAX_DEGREE_FILES} tệp.`);
        }
        return {
            dto: parsedDto,
            avatarFile,
            identityCardFile,
            degreeFiles
        };
    }
    toOptionalText(value) {
        if (typeof value !== "string") {
            return undefined;
        }
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    toExpressFile(multipartFile, buffer) {
        return {
            fieldname: multipartFile.fieldname || "file",
            originalname: multipartFile.filename || "upload.bin",
            encoding: multipartFile.encoding || "7bit",
            mimetype: multipartFile.mimetype || "application/octet-stream",
            size: buffer.length,
            buffer,
            destination: "",
            filename: multipartFile.filename || "upload.bin",
            path: "",
            stream: multipartFile.file
        };
    }
    constructor(queryBus, commandBus){
        this.queryBus = queryBus;
        this.commandBus = commandBus;
        this.avatarPipe = new _enterprisefilepipe.EnterpriseFilePipe("USER_AVATAR");
        this.kycFilePipe = new _enterprisefilepipe.EnterpriseFilePipe("KYC_DOCUMENT");
        this.identityFieldNames = new Set([
            "identifyCardUrl",
            "identityCard",
            "identity_card",
            "identityCardFile"
        ]);
        this.degreeFieldNames = new Set([
            "degrees",
            "supportingDocuments",
            "supporting_documents"
        ]);
        this.avatarFieldNames = new Set([
            "avatar",
            "avatarFile"
        ]);
    }
};
TeacherProfileController.MAX_DEGREE_FILES = 10;
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherProfileController.prototype, "getMyProfile", null);
_ts_decorate([
    (0, _common.Put)(),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _updatemyteacherprofileapi.UpdateMyTeacherProfileDto === "undefined" ? Object : _updatemyteacherprofileapi.UpdateMyTeacherProfileDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TeacherProfileController.prototype, "updateMyProfile", null);
TeacherProfileController = _ts_decorate([
    (0, _common.Controller)("teachers/me/profile"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.LECTURER),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus,
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], TeacherProfileController);

//# sourceMappingURL=teacher-profile.controller.js.map