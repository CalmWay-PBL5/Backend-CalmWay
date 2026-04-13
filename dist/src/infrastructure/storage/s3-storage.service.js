"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "S3StorageService", {
    enumerable: true,
    get: function() {
        return S3StorageService;
    }
});
const _common = require("@nestjs/common");
const _clients3 = require("@aws-sdk/client-s3");
const _s3requestpresigner = require("@aws-sdk/s3-request-presigner");
const _appconfigservice = require("../../core/config/app-config.service");
const _crypto = require("crypto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let S3StorageService = class S3StorageService {
    async uploadFile(file, folder) {
        if (!file || !file.buffer || file.size <= 0) {
            throw new _common.BadRequestException("Tệp tải lên không hợp lệ.");
        }
        const safeFolder = this.sanitizeFolder(folder);
        const safeOriginalName = this.sanitizeFileName(file.originalname);
        const fileName = `${safeFolder}/${Date.now()}-${(0, _crypto.randomUUID)()}-${safeOriginalName}`;
        try {
            const command = new _clients3.PutObjectCommand({
                Bucket: this.bucket,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype
            });
            await this.withTimeout(this.client.send(command), S3StorageService.UPLOAD_TIMEOUT_MS);
            this.logger.log(`✅ File uploaded successfully: ${fileName}`);
            const encodedKey = fileName.split("/").map(encodeURIComponent).join("/");
            return `${this.getPublicEndpoint()}/${this.bucket}/${encodedKey}`;
        } catch (error) {
            this.logger.error(`❌ Failed to upload file to S3: ${fileName}`, error);
            if (this.isUploadTimeoutError(error)) {
                throw new _common.ServiceUnavailableException("Storage service timeout. Please try again.");
            }
            throw new _common.InternalServerErrorException("Could not save document. Please try again.");
        }
    }
    extractKeyFromUrl(fullUrl) {
        const withoutQuery = fullUrl.split("?")[0];
        try {
            const parsedUrl = new URL(withoutQuery);
            const normalizedPath = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
            const bucketPrefix = `${this.bucket}/`;
            if (normalizedPath.startsWith(bucketPrefix)) {
                return normalizedPath.slice(bucketPrefix.length);
            }
        } catch  {
        // Ignore parse errors and continue with string-based fallback.
        }
        const normalized = decodeURIComponent(withoutQuery.replace(/^\/+/, ""));
        if (normalized.startsWith(`${this.bucket}/`)) {
            return normalized.slice(this.bucket.length + 1);
        }
        return normalized;
    }
    async getPresignedUrl(fullUrl, expirySeconds = 900) {
        try {
            const key = this.extractKeyFromUrl(fullUrl);
            const command = new _clients3.GetObjectCommand({
                Bucket: this.bucket,
                Key: key
            });
            return await (0, _s3requestpresigner.getSignedUrl)(this.presignClient, command, {
                expiresIn: expirySeconds
            });
        } catch (error) {
            this.logger.error(`❌ Failed to generate presigned URL for: ${fullUrl}`, error);
            return fullUrl;
        }
    }
    toPublicUrl(fullUrl) {
        const key = this.extractKeyFromUrl(fullUrl);
        const encodedKey = key.split("/").map(encodeURIComponent).join("/");
        return `${this.getPublicEndpoint()}/${this.bucket}/${encodedKey}`;
    }
    sanitizeFolder(folder) {
        return folder.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "-").replace(/\/+/g, "/") || "uploads";
    }
    sanitizeFileName(originalName) {
        return originalName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || "file";
    }
    createS3Client(endpoint) {
        return new _clients3.S3Client({
            endpoint,
            region: this.config.get("S3_REGION") || "us-east-1",
            credentials: {
                accessKeyId: this.config.get("S3_ACCESS_KEY"),
                secretAccessKey: this.config.get("S3_SECRET_KEY")
            },
            forcePathStyle: true,
            // MinIO compatibility: tránh ký thêm x-amz-checksum-mode trên presigned URL
            // (một số phiên bản MinIO có thể trả SignatureDoesNotMatch).
            requestChecksumCalculation: "WHEN_REQUIRED",
            responseChecksumValidation: "WHEN_REQUIRED"
        });
    }
    getPublicEndpoint() {
        const explicitPublicEndpoint = this.config.get("S3_PUBLIC_ENDPOINT");
        if (explicitPublicEndpoint) {
            return this.normalizeEndpoint(explicitPublicEndpoint);
        }
        const internalEndpoint = this.normalizeEndpoint(this.config.get("S3_ENDPOINT"));
        return this.mapMinioHostToLocalhost(internalEndpoint);
    }
    normalizeEndpoint(endpoint) {
        return endpoint.replace(/\/+$/, "");
    }
    mapMinioHostToLocalhost(endpoint) {
        try {
            const withProtocol = endpoint.includes("://") ? endpoint : `http://${endpoint}`;
            const parsedUrl = new URL(withProtocol);
            if (parsedUrl.hostname !== "minio") {
                return endpoint;
            }
            const port = parsedUrl.port ? `:${parsedUrl.port}` : "";
            return `${parsedUrl.protocol}//localhost${port}`;
        } catch  {
            return endpoint;
        }
    }
    async withTimeout(promise, timeoutMs) {
        let timeoutHandle;
        const timeoutPromise = new Promise((_, reject)=>{
            timeoutHandle = setTimeout(()=>{
                reject(new Error("S3_UPLOAD_TIMEOUT"));
            }, timeoutMs);
        });
        try {
            return await Promise.race([
                promise,
                timeoutPromise
            ]);
        } finally{
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
        }
    }
    isUploadTimeoutError(error) {
        return error instanceof Error && error.message === "S3_UPLOAD_TIMEOUT";
    }
    constructor(config){
        this.config = config;
        this.logger = new _common.Logger(S3StorageService.name);
        this.bucket = this.config.get("S3_BUCKET_NAME");
        const internalEndpoint = this.normalizeEndpoint(this.config.get("S3_ENDPOINT"));
        const publicEndpoint = this.getPublicEndpoint();
        this.client = this.createS3Client(internalEndpoint);
        this.presignClient = this.createS3Client(publicEndpoint);
    }
};
S3StorageService.UPLOAD_TIMEOUT_MS = 15000;
S3StorageService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], S3StorageService);

//# sourceMappingURL=s3-storage.service.js.map