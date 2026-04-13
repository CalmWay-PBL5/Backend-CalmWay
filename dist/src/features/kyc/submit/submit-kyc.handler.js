"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get SubmitKycCommand () {
        return SubmitKycCommand;
    },
    get SubmitKycHandler () {
        return SubmitKycHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _s3storageservice = require("../../../infrastructure/storage/s3-storage.service");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SubmitKycCommand = class SubmitKycCommand {
    constructor(userId, identityCardFile, supportingDocumentFiles){
        this.userId = userId;
        this.identityCardFile = identityCardFile;
        this.supportingDocumentFiles = supportingDocumentFiles;
    }
};
let SubmitKycHandler = class SubmitKycHandler {
    async execute(command) {
        const { userId, identityCardFile, supportingDocumentFiles } = command;
        const submittedAt = new Date();
        if (!identityCardFile) {
            throw new _common.BadRequestException("Thiếu ảnh CCCD/CMND.");
        }
        if (!supportingDocumentFiles?.length) {
            throw new _common.BadRequestException("Cần tải lên ít nhất 1 ảnh chứng chỉ hoặc giấy tờ chứng nhận.");
        }
        const existing = await this.prisma.kycApplication.findUnique({
            where: {
                userId
            }
        });
        if (existing && existing.status === _client.KycStatus.PENDING) {
            throw new _common.BadRequestException("You already have a pending application.");
        }
        const [identityCardUrl, supportingDocumentUrls] = await Promise.all([
            this.storage.uploadFile(identityCardFile, "kyc/identity-cards"),
            Promise.all(supportingDocumentFiles.map((file)=>this.storage.uploadFile(file, "kyc/supporting-documents")))
        ]);
        return await this.prisma.kycApplication.upsert({
            where: {
                userId
            },
            update: {
                // Khi nộp lại hồ sơ, ghi nhận lại mốc thời gian nộp mới.
                createdAt: submittedAt,
                identityCardUrl,
                supportingDocumentUrls,
                status: _client.KycStatus.PENDING,
                rejectionReason: null,
                reviewedBy: null,
                reviewedAt: null
            },
            create: {
                userId,
                createdAt: submittedAt,
                identityCardUrl,
                supportingDocumentUrls
            }
        });
    }
    constructor(prisma, storage){
        this.prisma = prisma;
        this.storage = storage;
    }
};
SubmitKycHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(SubmitKycCommand),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _s3storageservice.S3StorageService === "undefined" ? Object : _s3storageservice.S3StorageService
    ])
], SubmitKycHandler);

//# sourceMappingURL=submit-kyc.handler.js.map