"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KycController", {
    enumerable: true,
    get: function() {
        return KycController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _rolesguard = require("../auth/guards/roles.guard");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _reviewkycapi = require("./review-kyc/review-kyc.api");
const _reviewkyccommand = require("./review-kyc/review-kyc.command");
const _submitkychandler = require("./submit/submit-kyc.handler");
const _enterprisefilepipe = require("../../shared/file-upload/enterprise-file.pipe");
const _getmykycquery = require("./queries/get-my-kyc.query");
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
let KycController = class KycController {
    async submitKyc(req) {
        this.ensureMultipartRequest(req);
        const { identityCardFile, supportingDocumentFiles } = await this.extractMultipartPayload(req);
        return await this.commandBus.execute(new _submitkychandler.SubmitKycCommand(req.user.id, identityCardFile, supportingDocumentFiles));
    }
    async getMyKyc(req) {
        return await this.queryBus.execute(new _getmykycquery.GetMyKycQuery(req.user.id));
    }
    async reviewKyc(id, dto, req) {
        return await this.commandBus.execute(new _reviewkyccommand.ReviewKycCommand(id, req.user.id, dto));
    }
    async extractMultipartPayload(req) {
        const iterator = req.parts?.();
        if (!iterator) {
            throw new _common.BadRequestException("Yêu cầu upload không hợp lệ.");
        }
        let identityCardFile;
        const supportingDocumentFiles = [];
        for await (const part of iterator){
            if (part.type !== "file") {
                continue;
            }
            // Fastify multipart yêu cầu tiêu thụ stream; nếu không request có thể bị treo.
            const fileBuffer = await part.toBuffer();
            const file = this.kycFilePipe.transform(this.toExpressFile(part, fileBuffer));
            const fieldName = String(part.fieldname ?? "").trim();
            if (this.identityFieldNames.has(fieldName)) {
                if (identityCardFile) {
                    throw new _common.BadRequestException("Chỉ được gửi 1 ảnh CCCD/CMND.");
                }
                identityCardFile = file;
                continue;
            }
            if (this.supportingFieldNames.has(fieldName)) {
                supportingDocumentFiles.push(file);
                continue;
            }
            // Tương thích ngược: nếu frontend cũ gửi chung 1 field, file đầu là CCCD,
            // các file sau là chứng chỉ/giấy tờ bổ sung.
            if (!identityCardFile) {
                identityCardFile = file;
            } else {
                supportingDocumentFiles.push(file);
            }
        }
        if (!identityCardFile) {
            throw new _common.BadRequestException("Vui lòng tải lên 1 ảnh CCCD/CMND.");
        }
        if (!supportingDocumentFiles.length) {
            throw new _common.BadRequestException("Vui lòng tải lên ít nhất 1 ảnh chứng chỉ hoặc giấy tờ chứng nhận.");
        }
        if (supportingDocumentFiles.length > KycController.MAX_SUPPORTING_FILES) {
            throw new _common.BadRequestException(`Số lượng ảnh chứng chỉ tối đa là ${KycController.MAX_SUPPORTING_FILES}.`);
        }
        return {
            identityCardFile,
            supportingDocumentFiles
        };
    }
    ensureMultipartRequest(req) {
        const isMultipart = typeof req.isMultipart === "function" ? req.isMultipart() : false;
        if (!isMultipart) {
            throw new _common.UnsupportedMediaTypeException("Yêu cầu phải dùng multipart/form-data.");
        }
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
    constructor(commandBus, queryBus){
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.kycFilePipe = new _enterprisefilepipe.EnterpriseFilePipe("KYC_DOCUMENT");
        this.identityFieldNames = new Set([
            "identityCard",
            "identity_card",
            "cccd",
            "identity"
        ]);
        this.supportingFieldNames = new Set([
            "supportingDocuments",
            "supporting_documents",
            "credentials",
            "certificates",
            "documents"
        ]);
    }
};
KycController.MAX_SUPPORTING_FILES = 10;
_ts_decorate([
    (0, _common.Post)("submit"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.LECTURER),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], KycController.prototype, "submitKyc", null);
_ts_decorate([
    (0, _common.Get)("me"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.LECTURER),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], KycController.prototype, "getMyKyc", null);
_ts_decorate([
    (0, _common.Patch)(":id/review"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_client.Role.ADMIN),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _reviewkycapi.ReviewKycDto === "undefined" ? Object : _reviewkycapi.ReviewKycDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], KycController.prototype, "reviewKyc", null);
KycController = _ts_decorate([
    (0, _common.Controller)("kyc"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus,
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus
    ])
], KycController);

//# sourceMappingURL=kyc.controller.js.map