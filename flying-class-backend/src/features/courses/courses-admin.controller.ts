import { Controller, Patch, Param, Body, UseGuards, Req } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ReviewCourseDto } from "./moderation/review-course.api";
import { ReviewCourseCommand } from "./moderation/review-course.command";

@Controller("admin/courses")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CoursesAdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(":id/review")
  async reviewCourse(
    @Param("id") courseId: string,
    @Body() dto: ReviewCourseDto,
    @Req() req: any,
  ) {
    return await this.commandBus.execute(
      new ReviewCourseCommand(courseId, req.user.id, dto),
    );
  }
}
