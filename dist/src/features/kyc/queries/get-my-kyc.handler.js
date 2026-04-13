"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyKycHandler", {
    enumerable: true,
    get: function() {
        return GetMyKycHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _s3storageservice = require("../../../infrastructure/storage/s3-storage.service");
const _client = require("@prisma/client");
const _getmykycquery = require("./get-my-kyc.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyKycHandler = class GetMyKycHandler {
    async execute(query) {
        const application = await this.prisma.kycApplication.findUnique({
            where: {
                userId: query.userId
            },
            select: {
                id: true,
                userId: true,
                identityCardUrl: true,
                supportingDocumentUrls: true,
                status: true,
                rejectionReason: true,
                reviewedBy: true,
                reviewedAt: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!application) {
            return {
                submitted: false,
                status: null,
                canAccessDashboard: false,
                requiresKycSubmission: true,
                isKycPendingReview: false,
                canResubmit: true,
                application: null
            };
        }
        const identityCardUrl = application.identityCardUrl ?? null;
        const supportingDocumentUrls = this.toUrlList(application.supportingDocumentUrls);
        const [secureIdentityCardUrl, secureSupportingDocumentUrls] = await Promise.all([
            identityCardUrl ? this.storage.getPresignedUrl(identityCardUrl) : Promise.resolve(null),
            Promise.all(supportingDocumentUrls.map((url)=>this.storage.getPresignedUrl(url)))
        ]);
        return {
            submitted: true,
            status: application.status,
            canAccessDashboard: application.status === _client.KycStatus.APPROVED,
            requiresKycSubmission: application.status === _client.KycStatus.REJECTED,
            isKycPendingReview: application.status === _client.KycStatus.PENDING,
            canResubmit: application.status === _client.KycStatus.REJECTED,
            application: {
                ...application,
                identityCardPublicUrl: identityCardUrl ? this.resolvePublicUrl(identityCardUrl) : null,
                secureIdentityCardUrl,
                supportingDocumentPublicUrls: supportingDocumentUrls.map((url)=>this.resolvePublicUrl(url)),
                secureSupportingDocumentUrls
            }
        };
    }
    toUrlList(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item)=>typeof item === "string");
    }
    resolvePublicUrl(url) {
        const storageWithPublicUrl = this.storage;
        if (typeof storageWithPublicUrl.toPublicUrl === "function") {
            return storageWithPublicUrl.toPublicUrl(url);
        }
        return url;
    }
    constructor(prisma, storage){
        this.prisma = prisma;
        this.storage = storage;
    }
};
GetMyKycHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmykycquery.GetMyKycQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _s3storageservice.S3StorageService === "undefined" ? Object : _s3storageservice.S3StorageService
    ])
], GetMyKycHandler);

//# sourceMappingURL=get-my-kyc.handler.js.map