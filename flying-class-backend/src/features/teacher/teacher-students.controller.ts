import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { FastifyReply } from "fastify";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  GetMyTeacherStudentsDto,
  SearchMyTeacherStudentsDto,
} from "./students/get-my-teacher-students.api";
import { GetMyTeacherStudentsQuery } from "./students/get-my-teacher-students.query";
import { SearchMyTeacherStudentsQuery } from "./students/search-my-teacher-students.query";
import { GetMyTeacherStudentStatsQuery } from "./students/get-my-teacher-student-stats.query";
import { GetMyTeacherStudentDetailQuery } from "./students/get-my-teacher-student-detail.query";
import { ExportMyTeacherStudentsQuery } from "./students/export-my-teacher-students.query";
import { ExportMyTeacherCourseStudentsQuery } from "./students/export-my-teacher-course-students.query";

@Controller("teachers/me/students")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LECTURER)
export class TeacherStudentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getAllStudents(@Req() req: any, @Query() query: GetMyTeacherStudentsDto) {
    return await this.queryBus.execute(
      new GetMyTeacherStudentsQuery(req.user.id, query.skip, query.take),
    );
  }

  @Get("search/query")
  async searchStudents(@Req() req: any, @Query() query: SearchMyTeacherStudentsDto) {
    const keyword = query.q?.trim();
    if (!keyword) {
      throw new BadRequestException('Tham số "q" không được để trống.');
    }

    return await this.queryBus.execute(
      new SearchMyTeacherStudentsQuery(req.user.id, keyword, query.skip, query.take),
    );
  }

  @Get("stats/overview")
  async getStats(@Req() req: any) {
    return await this.queryBus.execute(
      new GetMyTeacherStudentStatsQuery(req.user.id),
    );
  }

  @Get("export/all")
  async exportAll(@Req() req: any, @Res({ passthrough: true }) res: FastifyReply) {
    const exported = await this.queryBus.execute(
      new ExportMyTeacherStudentsQuery(req.user.id),
    );

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header(
      "Content-Disposition",
      `attachment; filename=\"${exported.fileName}\"`,
    );

    return `\uFEFF${exported.csv}`;
  }

  @Get("export/course/:courseId")
  async exportByCourse(
    @Req() req: any,
    @Param("courseId") courseId: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const exported = await this.queryBus.execute(
      new ExportMyTeacherCourseStudentsQuery(req.user.id, courseId),
    );

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header(
      "Content-Disposition",
      `attachment; filename=\"${exported.fileName}\"`,
    );

    return `\uFEFF${exported.csv}`;
  }

  @Get(":studentId")
  async getStudentDetail(@Req() req: any, @Param("studentId") studentId: string) {
    return await this.queryBus.execute(
      new GetMyTeacherStudentDetailQuery(req.user.id, studentId),
    );
  }
}
