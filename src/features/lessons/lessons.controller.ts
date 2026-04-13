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
  ) {}

  @Post("cloud-doc")
  async createCloudDoc(@Req() req: any, @Body() dto: CreateCloudDocDto) {
    return await this.commandBus.execute(new CreateCloudDocCommand(req.user.id, dto));
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

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: any, @Param("id") lessonId: string) {
    await this.commandBus.execute(new DeleteCloudDocCommand(req.user.id, lessonId));
  }
}
