"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetKycListHandler", {
    enumerable: true,
    get: function() {
        return GetKycListHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _getkyclistquery = require("./get-kyc-list.query");
const _s3storageservice = require("../../../infrastructure/storage/s3-storage.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetKycListHandler = class GetKycListHandler {
    async execute(query) {
        const { page, limit, status } = query;
        const skip = (page - 1) * limit;
        const where = status ? {
            status: status
        } : {};
        const [data, total] = await Promise.all([
            this.prisma.kycApplication.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true,
                            id: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            }),
            this.prisma.kycApplication.count({
                where
            })
        ]);
        const dataWithSecureUrls = await Promise.all(data.map(async (request)=>{
            const identityCardUrl = request.identityCardUrl ?? null;
            const supportingDocumentUrls = this.toUrlList(request.supportingDocumentUrls);
            const [secureIdentityCardUrl, secureSupportingDocumentUrls] = await Promise.all([
                identityCardUrl ? this.storage.getPresignedUrl(identityCardUrl) : Promise.resolve(null),
                Promise.all(supportingDocumentUrls.map((url)=>this.storage.getPresignedUrl(url)))
            ]);
            return {
                ...request,
                documentUrl: identityCardUrl,
                documentType: "IDENTITY_CARD",
                identityCardPublicUrl: identityCardUrl ? this.resolvePublicUrl(identityCardUrl) : null,
                secureIdentityCardUrl,
                publicDocumentUrl: identityCardUrl ? this.resolvePublicUrl(identityCardUrl) : null,
                secureImageUrl: secureIdentityCardUrl,
                supportingDocumentPublicUrls: supportingDocumentUrls.map((url)=>this.resolvePublicUrl(url)),
                secureSupportingDocumentUrls
            };
        }));
        return {
            data: dataWithSecureUrls,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
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
GetKycListHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getkyclistquery.GetKycListQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _s3storageservice.S3StorageService === "undefined" ? Object : _s3storageservice.S3StorageService
    ])
], GetKycListHandler);

//# sourceMappingURL=get-kyc-list.handler.js.map