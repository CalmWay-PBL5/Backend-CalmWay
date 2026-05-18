import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { LessonService } from "@/modules/lesson/lesson.service";
import { CreateLessonDto } from "@/modules/lesson/dto/create-lesson.dto";
import { UpdateLessonDto } from "@/modules/lesson/dto/update-lesson.dto";
import { CreateCloudDocDto } from "./cloud-doc/create-cloud-doc.api";
import { CreateCloudDocCommand } from "./cloud-doc/create-cloud-doc.command";
import { ListClassCloudDocsQuery } from "./cloud-doc/list-cloud-docs.query";
import { UpdateCloudDocTitleDto } from "./cloud-doc/update-cloud-doc-title.api";
import { UpdateCloudDocTitleCommand } from "./cloud-doc/update-cloud-doc-title.command";
import { DeleteCloudDocCommand } from "./cloud-doc/delete-cloud-doc.command";

@Controller("lessons")
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly lessonService: LessonService,
  ) {}

  @Post("cloud-doc")
  async createCloudDoc(@Req() req: any, @Body() dto: CreateCloudDocDto) {
    return await this.commandBus.execute(new CreateCloudDocCommand(req.user.id, dto));
  }

  @Get()
  async findAll() {
    return await this.lessonService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.lessonService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateLessonDto) {
    return await this.lessonService.create(dto);
  }

  @Get("class/:classId/cloud-docs")
  async getCloudDocs(@Req() req: any, @Param("classId") classId: string) {
    return await this.queryBus.execute(
      new ListClassCloudDocsQuery(req.user.id, classId),
    );
  }

  @Patch(":id/title")
  async updateTitle(
    @Req() req: any,
    @Param("id") lessonId: string,
    @Body() dto: UpdateCloudDocTitleDto,
  ) {
    return await this.commandBus.execute(
      new UpdateCloudDocTitleCommand(req.user.id, lessonId, dto.title),
    );
  }

  @Patch(":id")
  async update(@Param("id") lessonId: string, @Body() dto: UpdateLessonDto) {
    return await this.lessonService.update(lessonId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: any, @Param("id") lessonId: string) {
    const lesson = await this.lessonService.findOne(lessonId);
    if (lesson.contentType === "CLOUD_DOC") {
      await this.commandBus.execute(new DeleteCloudDocCommand(req.user.id, lessonId));
      return;
    }

    await this.lessonService.remove(lessonId);
  }
}
