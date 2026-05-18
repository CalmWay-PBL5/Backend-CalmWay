import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { RolesGuard } from "../auth/guards/roles.guard";
import { TeacherProfileController } from "./teacher-profile.controller";
import { TeacherRevenueController } from "./teacher-revenue.controller";
import { TeacherStudentsController } from "./teacher-students.controller";
import { TeacherClassesController } from "./teacher-classes.controller";
import { TeacherClassMembersController } from "./teacher-class-members.controller";
import { AdminClassesController } from "./admin-classes.controller";
import { GetMyTeacherProfileHandler } from "./profile/get-my-teacher-profile.handler";
import { UpdateMyTeacherProfileHandler } from "./profile/update-my-teacher-profile.handler";
import { GetMyTeacherRevenueSummaryHandler } from "./revenue/get-my-teacher-revenue-summary.handler";
import { GetMyTeacherMonthlyRevenueHandler } from "./revenue/get-my-teacher-monthly-revenue.handler";
import { GetMyTeacherStudentsHandler } from "./students/get-my-teacher-students.handler";
import { SearchMyTeacherStudentsHandler } from "./students/search-my-teacher-students.handler";
import { GetMyTeacherStudentStatsHandler } from "./students/get-my-teacher-student-stats.handler";
import { GetMyTeacherStudentDetailHandler } from "./students/get-my-teacher-student-detail.handler";
import { ExportMyTeacherStudentsHandler } from "./students/export-my-teacher-students.handler";
import { ExportMyTeacherCourseStudentsHandler } from "./students/export-my-teacher-course-students.handler";
import { CreateMyClassHandler } from "./classes/create-my-class.handler";
import { ListMyClassesHandler } from "./classes/list-my-classes.handler";
import { GetMyClassHandler } from "./classes/get-my-class.handler";
import { UpdateMyClassHandler } from "./classes/update-my-class.handler";
import { MoveMyClassToTrashHandler } from "./classes/move-my-class-to-trash.handler";
import { RestoreMyClassHandler } from "./classes/restore-my-class.handler";
import { ListMyTrashClassesHandler } from "./classes/list-my-trash-classes.handler";
import { GetMyClassDashboardStatsHandler } from "./classes/get-my-class-dashboard-stats.handler";
import { ListMyClassDetailedReviewsHandler } from "./classes/list-my-class-detailed-reviews.handler";
import { ExportMyClassesHandler } from "./classes/export-my-classes.handler";
import { ExportMyClassMembersHandler } from "./classes/export-my-class-members.handler";
import { CleanupMyTrashClassesHandler } from "./classes/cleanup-my-trash-classes.handler";
import { ListMySubjectsHandler } from "./classes/list-my-subjects.handler";
import { GetAdminClassDetailHandler } from "./classes/get-admin-class-detail.handler";
import { PauseClassByAdminHandler } from "./classes/pause-class-by-admin.handler";
import { ResumeClassByAdminHandler } from "./classes/resume-class-by-admin.handler";
import { ListAdminClassesHandler } from "./classes/list-admin-classes.handler";
import { AddMyClassMemberHandler } from "./class-members/add-my-class-member.handler";
import { ListMyClassMembersHandler } from "./class-members/list-my-class-members.handler";
import { RemoveMyClassMemberHandler } from "./class-members/remove-my-class-member.handler";

@Module({
  imports: [CqrsModule],
  controllers: [
    TeacherProfileController,
    TeacherRevenueController,
    TeacherStudentsController,
    TeacherClassesController,
    TeacherClassMembersController,
    AdminClassesController,
  ],
  providers: [
    RolesGuard,
    GetMyTeacherProfileHandler,
    UpdateMyTeacherProfileHandler,
    GetMyTeacherRevenueSummaryHandler,
    GetMyTeacherMonthlyRevenueHandler,
    GetMyTeacherStudentsHandler,
    SearchMyTeacherStudentsHandler,
    GetMyTeacherStudentStatsHandler,
    GetMyTeacherStudentDetailHandler,
    ExportMyTeacherStudentsHandler,
    ExportMyTeacherCourseStudentsHandler,
    CreateMyClassHandler,
    ListMyClassesHandler,
    GetMyClassHandler,
    UpdateMyClassHandler,
    MoveMyClassToTrashHandler,
    RestoreMyClassHandler,
    ListMyTrashClassesHandler,
    GetMyClassDashboardStatsHandler,
    ListMyClassDetailedReviewsHandler,
    ExportMyClassesHandler,
    ExportMyClassMembersHandler,
    CleanupMyTrashClassesHandler,
    ListMySubjectsHandler,
    ListAdminClassesHandler,
    GetAdminClassDetailHandler,
    PauseClassByAdminHandler,
    ResumeClassByAdminHandler,
    AddMyClassMemberHandler,
    ListMyClassMembersHandler,
    RemoveMyClassMemberHandler,
  ],
})
export class TeacherModule {}
