import {
  BadRequestException,
  Controller,
  Body,
  Get,
  Patch,
  Param,
  Post,
  UnsupportedMediaTypeException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ReviewKycDto } from "./review-kyc/review-kyc.api";
import { ReviewKycCommand } from "./review-kyc/review-kyc.command";
import { SubmitKycCommand } from "./submit/submit-kyc.handler";
import { EnterpriseFilePipe } from "@/shared/file-upload/enterprise-file.pipe";
import { GetMyKycQuery } from "./queries/get-my-kyc.query";

@Controller("kyc")
export class KycController {
  private readonly kycFilePipe = new EnterpriseFilePipe("KYC_DOCUMENT");
  private static readonly MAX_SUPPORTING_FILES = 10;
  private readonly identityFieldNames = new Set([
    "identityCard",
    "identity_card",
    "cccd",
    "identity",
  ]);
  private readonly supportingFieldNames = new Set([
    "supportingDocuments",
    "supporting_documents",
    "credentials",
    "certificates",
    "documents",
  ]);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post("submit")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LECTURER)
  async submitKyc(@Req() req: any) {
    this.ensureMultipartRequest(req);
    const { identityCardFile, supportingDocumentFiles } =
      await this.extractMultipartPayload(req);

    return await this.commandBus.execute(
      new SubmitKycCommand(req.user.id, identityCardFile, supportingDocumentFiles),
    );
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LECTURER)
  async getMyKyc(@Req() req: any) {
    return await this.queryBus.execute(new GetMyKycQuery(req.user.id));
  }

  @Patch(":id/review")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reviewKyc(
    @Param("id") id: string,
    @Body() dto: ReviewKycDto,
    @Req() req: any,
  ) {
    return await this.commandBus.execute(
      new ReviewKycCommand(id, req.user.id, dto),
    );
  }

  private async extractMultipartPayload(req: any) {
    const iterator = req.parts?.();
    if (!iterator) {
      throw new BadRequestException("Yêu cầu upload không hợp lệ.");
    }

    let identityCardFile: Express.Multer.File | undefined;
    const supportingDocumentFiles: Express.Multer.File[] = [];

    for await (const part of iterator) {
      if (part.type !== "file") {
        continue;
      }

      // Fastify multipart yêu cầu tiêu thụ stream; nếu không request có thể bị treo.
      const fileBuffer = await part.toBuffer();
      const file = this.kycFilePipe.transform(
        this.toExpressFile(part, fileBuffer),
      );
      const fieldName = String(part.fieldname ?? "").trim();

      if (this.identityFieldNames.has(fieldName)) {
        if (identityCardFile) {
          throw new BadRequestException("Chỉ được gửi 1 ảnh CCCD/CMND.");
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
      throw new BadRequestException("Vui lòng tải lên 1 ảnh CCCD/CMND.");
    }

    if (!supportingDocumentFiles.length) {
      throw new BadRequestException(
        "Vui lòng tải lên ít nhất 1 ảnh chứng chỉ hoặc giấy tờ chứng nhận.",
      );
    }

    if (supportingDocumentFiles.length > KycController.MAX_SUPPORTING_FILES) {
      throw new BadRequestException(
        `Số lượng ảnh chứng chỉ tối đa là ${KycController.MAX_SUPPORTING_FILES}.`,
      );
    }

    return { identityCardFile, supportingDocumentFiles };
  }

  private ensureMultipartRequest(req: any) {
    const isMultipart =
      typeof req.isMultipart === "function" ? req.isMultipart() : false;
    if (!isMultipart) {
      throw new UnsupportedMediaTypeException(
        "Yêu cầu phải dùng multipart/form-data.",
      );
    }
  }

  private toExpressFile(
    multipartFile: any,
    buffer: Buffer,
  ): Express.Multer.File {
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
      stream: multipartFile.file,
    };
  }
}
