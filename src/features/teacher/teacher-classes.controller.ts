import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FastifyReply } from "fastify";
import { Role } from "@prisma/client";
import { EnterpriseFilePipe } from "@/shared/file-upload/enterprise-file.pipe";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateMyClassDto } from "./classes/create-my-class.api";
import { UpdateMyClassDto } from "./classes/update-my-class.api";
import { CreateMyClassCommand } from "./classes/create-my-class.command";
import { ListMyClassesQuery } from "./classes/list-my-classes.query";
import { GetMyClassDashboardStatsQuery } from "./classes/get-my-class-dashboard-stats.query";
import { ListMyTrashClassesQuery } from "./classes/list-my-trash-classes.query";
import { ExportMyClassesQuery } from "./classes/export-my-classes.query";
import { ExportMyClassMembersQuery } from "./classes/export-my-class-members.query";
import { GetMyClassQuery } from "./classes/get-my-class.query";
import { UpdateMyClassCommand } from "./classes/update-my-class.command";
import { MoveMyClassToTrashCommand } from "./classes/move-my-class-to-trash.command";
import { RestoreMyClassCommand } from "./classes/restore-my-class.command";
import { ListMyClassDetailedReviewsQuery } from "./classes/list-my-class-detailed-reviews.query";
import { CleanupMyTrashClassesCommand } from "./classes/cleanup-my-trash-classes.command";
import { ListMySubjectsQuery } from "./classes/list-my-subjects.query";

@Controller("teachers/me/classes")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LECTURER)
export class TeacherClassesController {
  private readonly coverPipe = new EnterpriseFilePipe("CLASS_COVER");
  private readonly coverFieldNames = new Set(["coverImage", "cover_image", "cover"]);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get("subjects")
  async getSubjects() {
    return await this.queryBus.execute(new ListMySubjectsQuery());
  }

  @Get("reviews/detailed")
  async getDetailedReviews(@Req() req: any) {
    return await this.queryBus.execute(
      new ListMyClassDetailedReviewsQuery(req.user.id),
    );
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateMyClassDto) {
    const payload = await this.extractPayload(req, dto);

    return await this.commandBus.execute(
      new CreateMyClassCommand(
        req.user.id,
        payload.dto as CreateMyClassDto,
        payload.coverImageFile,
      ),
    );
  }

  @Get()
  async findAll(@Req() req: any) {
    return await this.queryBus.execute(new ListMyClassesQuery(req.user.id));
  }

  @Get("dashboard/stats")
  async getDashboardStats(@Req() req: any) {
    return await this.queryBus.execute(
      new GetMyClassDashboardStatsQuery(req.user.id),
    );
  }

  @Get("trash")
  async findTrash(@Req() req: any) {
    return await this.queryBus.execute(new ListMyTrashClassesQuery(req.user.id));
  }

  @Post("trash/cleanup")
  async cleanupTrash(@Req() req: any) {
    return await this.commandBus.execute(
      new CleanupMyTrashClassesCommand(req.user.id),
    );
  }

  @Get("export/all")
  async exportAll(@Req() req: any, @Res({ passthrough: true }) res: FastifyReply) {
    const exported = await this.queryBus.execute(
      new ExportMyClassesQuery(req.user.id),
    );

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", `attachment; filename=\"${exported.fileName}\"`);

    return `\uFEFF${exported.csv}`;
  }

  @Get("export/:id/members")
  async exportMembers(
    @Req() req: any,
    @Param("id") classId: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const exported = await this.queryBus.execute(
      new ExportMyClassMembersQuery(req.user.id, classId),
    );

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", `attachment; filename=\"${exported.fileName}\"`);

    return `\uFEFF${exported.csv}`;
  }

  @Get(":id")
  async findOne(@Req() req: any, @Param("id") classId: string) {
    return await this.queryBus.execute(new GetMyClassQuery(req.user.id, classId));
  }

  @Patch(":id")
  async update(
    @Req() req: any,
    @Param("id") classId: string,
    @Body() dto: UpdateMyClassDto,
  ) {
    const payload = await this.extractPayload(req, dto);

    return await this.commandBus.execute(
      new UpdateMyClassCommand(
        req.user.id,
        classId,
        payload.dto as UpdateMyClassDto,
        payload.coverImageFile,
      ),
    );
  }

  @Put(":id")
  async replace(
    @Req() req: any,
    @Param("id") classId: string,
    @Body() dto: UpdateMyClassDto,
  ) {
    const payload = await this.extractPayload(req, dto);

    return await this.commandBus.execute(
      new UpdateMyClassCommand(
        req.user.id,
        classId,
        payload.dto as UpdateMyClassDto,
        payload.coverImageFile,
      ),
    );
  }

  @Delete(":id")
  async remove(@Req() req: any, @Param("id") classId: string) {
    return await this.commandBus.execute(
      new MoveMyClassToTrashCommand(req.user.id, classId),
    );
  }

  @Patch(":id/restore")
  async restore(@Req() req: any, @Param("id") classId: string) {
    return await this.commandBus.execute(
      new RestoreMyClassCommand(req.user.id, classId),
    );
  }

  private async extractPayload(
    req: any,
    dto: CreateMyClassDto | UpdateMyClassDto,
  ) {
    const isMultipart =
      typeof req.isMultipart === "function" ? req.isMultipart() : false;

    if (!isMultipart) {
      return {
        dto,
        coverImageFile: undefined as Express.Multer.File | undefined,
      };
    }

    const iterator = req.parts?.();
    if (!iterator) {
      throw new BadRequestException("Yêu cầu upload không hợp lệ.");
    }

    const parsedDto: Record<string, unknown> = {};
    let coverImageFile: Express.Multer.File | undefined;

    for await (const part of iterator) {
      if (part.type === "field") {
        const fieldName = String(part.fieldname ?? "").trim();
        const value = this.toOptionalText(part.value);

        if (fieldName === "title") {
          parsedDto.title = value;
          continue;
        }

        if (fieldName === "description") {
          parsedDto.description = value;
          continue;
        }

        if (fieldName === "price") {
          parsedDto.price = value;
          continue;
        }

        if (fieldName === "type") {
          parsedDto.type = value;
          continue;
        }

        if (fieldName === "maxStudents" || fieldName === "max_students") {
          parsedDto.maxStudents = value;
          continue;
        }

        if (fieldName === "subjectId" || fieldName === "subject_id") {
          parsedDto.subjectId = value;
        }

        continue;
      }

      if (part.type !== "file") {
        continue;
      }

      const fieldName = String(part.fieldname ?? "").trim();
      const buffer = await part.toBuffer();

      if (!this.coverFieldNames.has(fieldName)) {
        continue;
      }

      if (coverImageFile) {
        throw new BadRequestException("Chỉ được gửi tối đa 1 ảnh bìa lớp học.");
      }

      coverImageFile = this.coverPipe.transform(this.toExpressFile(part, buffer));
    }

    return {
      dto: parsedDto as CreateMyClassDto | UpdateMyClassDto,
      coverImageFile,
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
