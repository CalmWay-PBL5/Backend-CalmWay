import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // 🚀 Import thư viện mới
import { AppConfigService } from "@/core/config/app-config.service";
import { randomUUID } from "crypto";

@Injectable()
export class S3StorageService {
  private static readonly UPLOAD_TIMEOUT_MS = 15000;
  private readonly client?: S3Client;
  private readonly presignClient?: S3Client;
  private readonly logger = new Logger(S3StorageService.name);
  private readonly bucket?: string;
  private readonly enabled: boolean;

  constructor(private readonly config: AppConfigService) {
    const bucket = this.config.get("S3_BUCKET_NAME");
    const endpoint = this.config.get("S3_ENDPOINT");
    const accessKey = this.config.get("S3_ACCESS_KEY");
    const secretKey = this.config.get("S3_SECRET_KEY");

    if (!bucket || !endpoint || !accessKey || !secretKey) {
      this.enabled = false;
      this.logger.warn("S3 storage is disabled due to missing configuration.");
      return;
    }

    this.bucket = bucket;
    const internalEndpoint = this.normalizeEndpoint(endpoint);
    const publicEndpoint = this.getPublicEndpoint();
    this.client = this.createS3Client(internalEndpoint);
    this.presignClient = this.createS3Client(publicEndpoint);
    this.enabled = true;
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!this.enabled || !this.client || !this.bucket) {
      throw new ServiceUnavailableException("Storage service is not configured.");
    }

    if (!file || !file.buffer || file.size <= 0) {
      throw new BadRequestException("Tệp tải lên không hợp lệ.");
    }

    const safeFolder = this.sanitizeFolder(folder);
    const safeOriginalName = this.sanitizeFileName(file.originalname);
    const fileName = `${safeFolder}/${Date.now()}-${randomUUID()}-${safeOriginalName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.withTimeout(
        this.client.send(command),
        S3StorageService.UPLOAD_TIMEOUT_MS,
      );

      this.logger.log(`✅ File uploaded successfully: ${fileName}`);

      const encodedKey = fileName.split("/").map(encodeURIComponent).join("/");
      return `${this.getPublicEndpoint()}/${this.bucket}/${encodedKey}`;
    } catch (error) {
      this.logger.error(`❌ Failed to upload file to S3: ${fileName}`, error);

      if (this.isUploadTimeoutError(error)) {
        throw new ServiceUnavailableException(
          "Storage service timeout. Please try again.",
        );
      }

      throw new InternalServerErrorException(
        "Could not save document. Please try again.",
      );
    }
  }

  private extractKeyFromUrl(fullUrl: string): string {
    const withoutQuery = fullUrl.split("?")[0];

    try {
      const parsedUrl = new URL(withoutQuery);
      const normalizedPath = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
      const bucket = this.bucket ?? "";
      if (!bucket) {
        return normalizedPath;
      }
      const bucketPrefix = `${bucket}/`;
      if (normalizedPath.startsWith(bucketPrefix)) {
        return normalizedPath.slice(bucketPrefix.length);
      }
    } catch {
      // Ignore parse errors and continue with string-based fallback.
    }

    const normalized = decodeURIComponent(withoutQuery.replace(/^\/+/, ""));
    if (this.bucket && normalized.startsWith(`${this.bucket}/`)) {
      return normalized.slice(this.bucket.length + 1);
    }
    return normalized;
  }

  async getPresignedUrl(
    fullUrl: string,
    expirySeconds: number = 900,
  ): Promise<string> {
    if (!this.enabled || !this.presignClient || !this.bucket) {
      return fullUrl;
    }

    try {
      const key = this.extractKeyFromUrl(fullUrl);

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.presignClient, command, {
        expiresIn: expirySeconds,
      });
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate presigned URL for: ${fullUrl}`,
        error,
      );
      return fullUrl;
    }
  }

  toPublicUrl(fullUrl: string): string {
    if (!this.enabled || !this.bucket) {
      return fullUrl;
    }

    const key = this.extractKeyFromUrl(fullUrl);
    const encodedKey = key.split("/").map(encodeURIComponent).join("/");
    return `${this.getPublicEndpoint()}/${this.bucket}/${encodedKey}`;
  }

  private sanitizeFolder(folder: string) {
    return (
      folder
        .replace(/^\/+|\/+$/g, "")
        .replace(/[^a-zA-Z0-9/_-]/g, "-")
        .replace(/\/+/g, "/") || "uploads"
    );
  }

  private sanitizeFileName(originalName: string) {
    return (
      originalName
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "") || "file"
    );
  }

  private createS3Client(endpoint: string) {
    return new S3Client({
      endpoint,
      region: this.config.get("S3_REGION") || "us-east-1",
      credentials: {
        accessKeyId: this.config.get("S3_ACCESS_KEY") || "",
        secretAccessKey: this.config.get("S3_SECRET_KEY") || "",
      },
      forcePathStyle: true,
      // MinIO compatibility: tránh ký thêm x-amz-checksum-mode trên presigned URL
      // (một số phiên bản MinIO có thể trả SignatureDoesNotMatch).
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }

  private getPublicEndpoint() {
    const explicitPublicEndpoint = this.config.get("S3_PUBLIC_ENDPOINT");
    if (explicitPublicEndpoint) {
      return this.normalizeEndpoint(explicitPublicEndpoint);
    }

    const internalEndpoint = this.normalizeEndpoint(
      this.config.get("S3_ENDPOINT") || "",
    );
    return this.mapMinioHostToLocalhost(internalEndpoint);
  }

  private normalizeEndpoint(endpoint: string) {
    return endpoint.replace(/\/+$/, "");
  }

  private mapMinioHostToLocalhost(endpoint: string) {
    try {
      const withProtocol = endpoint.includes("://")
        ? endpoint
        : `http://${endpoint}`;
      const parsedUrl = new URL(withProtocol);

      if (parsedUrl.hostname !== "minio") {
        return endpoint;
      }

      const port = parsedUrl.port ? `:${parsedUrl.port}` : "";
      return `${parsedUrl.protocol}//localhost${port}`;
    } catch {
      return endpoint;
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    let timeoutHandle: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error("S3_UPLOAD_TIMEOUT"));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }

  private isUploadTimeoutError(error: unknown) {
    return error instanceof Error && error.message === "S3_UPLOAD_TIMEOUT";
  }
}
