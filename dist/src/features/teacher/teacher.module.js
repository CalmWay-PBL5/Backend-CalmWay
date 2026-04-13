"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeacherModule", {
    enumerable: true,
    get: function() {
        return TeacherModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _rolesguard = require("../auth/guards/roles.guard");
const _teacherprofilecontroller = require("./teacher-profile.controller");
const _teacherrevenuecontroller = require("./teacher-revenue.controller");
const _teacherstudentscontroller = require("./teacher-students.controller");
const _teacherclassescontroller = require("./teacher-classes.controller");
const _teacherclassmemberscontroller = require("./teacher-class-members.controller");
const _adminclassescontroller = require("./admin-classes.controller");
const _getmyteacherprofilehandler = require("./profile/get-my-teacher-profile.handler");
const _updatemyteacherprofilehandler = require("./profile/update-my-teacher-profile.handler");
const _getmyteacherrevenuesummaryhandler = require("./revenue/get-my-teacher-revenue-summary.handler");
const _getmyteachermonthlyrevenuehandler = require("./revenue/get-my-teacher-monthly-revenue.handler");
const _getmyteacherstudentshandler = require("./students/get-my-teacher-students.handler");
const _searchmyteacherstudentshandler = require("./students/search-my-teacher-students.handler");
const _getmyteacherstudentstatshandler = require("./students/get-my-teacher-student-stats.handler");
const _getmyteacherstudentdetailhandler = require("./students/get-my-teacher-student-detail.handler");
const _exportmyteacherstudentshandler = require("./students/export-my-teacher-students.handler");
const _exportmyteachercoursestudentshandler = require("./students/export-my-teacher-course-students.handler");
const _createmyclasshandler = require("./classes/create-my-class.handler");
const _listmyclasseshandler = require("./classes/list-my-classes.handler");
const _getmyclasshandler = require("./classes/get-my-class.handler");
const _updatemyclasshandler = require("./classes/update-my-class.handler");
const _movemyclasstotrashhandler = require("./classes/move-my-class-to-trash.handler");
const _restoremyclasshandler = require("./classes/restore-my-class.handler");
const _listmytrashclasseshandler = require("./classes/list-my-trash-classes.handler");
const _getmyclassdashboardstatshandler = require("./classes/get-my-class-dashboard-stats.handler");
const _listmyclassdetailedreviewshandler = require("./classes/list-my-class-detailed-reviews.handler");
const _exportmyclasseshandler = require("./classes/export-my-classes.handler");
const _exportmyclassmembershandler = require("./classes/export-my-class-members.handler");
const _cleanupmytrashclasseshandler = require("./classes/cleanup-my-trash-classes.handler");
const _listmysubjectshandler = require("./classes/list-my-subjects.handler");
const _getadminclassdetailhandler = require("./classes/get-admin-class-detail.handler");
const _pauseclassbyadminhandler = require("./classes/pause-class-by-admin.handler");
const _resumeclassbyadminhandler = require("./classes/resume-class-by-admin.handler");
const _listadminclasseshandler = require("./classes/list-admin-classes.handler");
const _addmyclassmemberhandler = require("./class-members/add-my-class-member.handler");
const _listmyclassmembershandler = require("./class-members/list-my-class-members.handler");
const _removemyclassmemberhandler = require("./class-members/remove-my-class-member.handler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let TeacherModule = class TeacherModule {
};
TeacherModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule
        ],
        controllers: [
            _teacherprofilecontroller.TeacherProfileController,
            _teacherrevenuecontroller.TeacherRevenueController,
            _teacherstudentscontroller.TeacherStudentsController,
            _teacherclassescontroller.TeacherClassesController,
            _teacherclassmemberscontroller.TeacherClassMembersController,
            _adminclassescontroller.AdminClassesController
        ],
        providers: [
            _rolesguard.RolesGuard,
            _getmyteacherprofilehandler.GetMyTeacherProfileHandler,
            _updatemyteacherprofilehandler.UpdateMyTeacherProfileHandler,
            _getmyteacherrevenuesummaryhandler.GetMyTeacherRevenueSummaryHandler,
            _getmyteachermonthlyrevenuehandler.GetMyTeacherMonthlyRevenueHandler,
            _getmyteacherstudentshandler.GetMyTeacherStudentsHandler,
            _searchmyteacherstudentshandler.SearchMyTeacherStudentsHandler,
            _getmyteacherstudentstatshandler.GetMyTeacherStudentStatsHandler,
            _getmyteacherstudentdetailhandler.GetMyTeacherStudentDetailHandler,
            _exportmyteacherstudentshandler.ExportMyTeacherStudentsHandler,
            _exportmyteachercoursestudentshandler.ExportMyTeacherCourseStudentsHandler,
            _createmyclasshandler.CreateMyClassHandler,
            _listmyclasseshandler.ListMyClassesHandler,
            _getmyclasshandler.GetMyClassHandler,
            _updatemyclasshandler.UpdateMyClassHandler,
            _movemyclasstotrashhandler.MoveMyClassToTrashHandler,
            _restoremyclasshandler.RestoreMyClassHandler,
            _listmytrashclasseshandler.ListMyTrashClassesHandler,
            _getmyclassdashboardstatshandler.GetMyClassDashboardStatsHandler,
            _listmyclassdetailedreviewshandler.ListMyClassDetailedReviewsHandler,
            _exportmyclasseshandler.ExportMyClassesHandler,
            _exportmyclassmembershandler.ExportMyClassMembersHandler,
            _cleanupmytrashclasseshandler.CleanupMyTrashClassesHandler,
            _listmysubjectshandler.ListMySubjectsHandler,
            _listadminclasseshandler.ListAdminClassesHandler,
            _getadminclassdetailhandler.GetAdminClassDetailHandler,
            _pauseclassbyadminhandler.PauseClassByAdminHandler,
            _resumeclassbyadminhandler.ResumeClassByAdminHandler,
            _addmyclassmemberhandler.AddMyClassMemberHandler,
            _listmyclassmembershandler.ListMyClassMembersHandler,
            _removemyclassmemberhandler.RemoveMyClassMemberHandler
        ]
    })
], TeacherModule);

//# sourceMappingURL=teacher.module.js.map