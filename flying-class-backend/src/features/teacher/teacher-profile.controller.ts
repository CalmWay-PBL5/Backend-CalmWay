import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Role } from "@prisma/client";
import { EnterpriseFilePipe } from "@/shared/file-upload/enterprise-file.pipe";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetMyTeacherProfileQuery } from "./profile/get-my-teacher-profile.query";
import { UpdateMyTeacherProfileCommand } from "./profile/update-my-teacher-profile.command";
import { UpdateMyTeacherProfileDto } from "./profile/update-my-teacher-profile.api";
import { SubmitKycCommand } from "../kyc/submit/submit-kyc.handler";

@Controller("teachers/me/profile")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LECTURER)
export class TeacherProfileController {
  private readonly avatarPipe = new EnterpriseFilePipe("USER_AVATAR");
  private readonly kycFilePipe = new EnterpriseFilePipe("KYC_DOCUMENT");
  private readonly identityFieldNames = new Set([
    "identifyCardUrl",
    "identityCard",
    "identity_card",
    "identityCardFile",
  ]);
  private readonly degreeFieldNames = new Set([
    "degrees",
    "supportingDocuments",
    "supporting_documents",
  ]);
  private readonly avatarFieldNames = new Set(["avatar", "avatarFile"]);
  private static readonly MAX_DEGREE_FILES = 10;

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getMyProfile(@Req() req: any) {
    return await this.queryBus.execute(new GetMyTeacherProfileQuery(req.user.id));
  }

  @Put()
  async updateMyProfile(@Req() req: any, @Body() dto: UpdateMyTeacherProfileDto) {
    const payload = await this.extractPayload(req, dto);

    let kycApplication: unknown;
    const hasKycUpload =
      Boolean(payload.identityCardFile) || payload.degreeFiles.length > 0;

    if (hasKycUpload) {
      if (!payload.identityCardFile || !payload.degreeFiles.length) {
        throw new BadRequestException(
          "Khi cập nhật hồ sơ KYC, cần gửi cả 1 file CCCD/CMND và ít nhất 1 file bằng cấp/chứng chỉ.",
        );
      }

      kycApplication = await this.commandBus.execute(
        new SubmitKycCommand(
          req.user.id,
          payload.identityCardFile,
          payload.degreeFiles,
        ),
      );
    }

    const profile = await this.commandBus.execute(
      new UpdateMyTeacherProfileCommand(
        req.user.id,
        payload.dto,
        payload.avatarFile,
      ),
    );

    return {
      profile,
      kycApplication,
    };
  }

  private async extractPayload(req: any, dto: UpdateMyTeacherProfileDto) {
    const isMultipart =
      typeof req.isMultipart === "function" ? req.isMultipart() : false;

    if (!isMultipart) {
      return {
        dto,
        avatarFile: undefined as Express.Multer.File | undefined,
        identityCardFile: undefined as Express.Multer.File | undefined,
        degreeFiles: [] as Express.Multer.File[],
      };
    }

    const iterator = req.parts?.();
    if (!iterator) {
      throw new BadRequestException("Yêu cầu upload không hợp lệ.");
    }

    const parsedDto: UpdateMyTeacherProfileDto = {};
    let avatarFile: Express.Multer.File | undefined;
    let identityCardFile: Express.Multer.File | undefined;
    const degreeFiles: Express.Multer.File[] = [];

    for await (const part of iterator) {
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
          throw new BadRequestException("Chỉ được gửi tối đa 1 ảnh đại diện.");
        }
        avatarFile = this.avatarPipe.transform(file);
        continue;
      }

      if (this.identityFieldNames.has(fieldName)) {
        if (identityCardFile) {
          throw new BadRequestException("Chỉ được gửi tối đa 1 file CCCD/CMND.");
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
      throw new BadRequestException(
        `Số lượng bằng cấp/chứng chỉ tối đa là ${TeacherProfileController.MAX_DEGREE_FILES} tệp.`,
      );
    }

    return {
      dto: parsedDto,
      avatarFile,
      identityCardFile,
      degreeFiles,
    };
  }

  private toOptionalText(value: unknown) {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
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
