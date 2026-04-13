"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CoursesModule", {
    enumerable: true,
    get: function() {
        return CoursesModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _bullmq = require("@nestjs/bullmq");
const _mailermodule = require("../../shared/mailer/mailer.module");
const _coursesadmincontroller = require("./courses-admin.controller");
const _reviewcoursehandler = require("./moderation/review-course.handler");
const _sendcoursereviewhandler = require("./workers/handlers/send-course-review.handler");
const _rolesguard = require("../auth/guards/roles.guard");
const _appconfigservice = require("../../core/config/app-config.service");
const _redisconnectionutil = require("../../infrastructure/redis/redis-connection.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CoursesModule = class CoursesModule {
};
CoursesModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule,
            _mailermodule.MailerModule,
            _bullmq.BullModule.registerQueueAsync({
                name: "auth-queue",
                inject: [
                    _appconfigservice.AppConfigService
                ],
                useFactory: (config)=>{
                    return {
                        connection: (0, _redisconnectionutil.parseRedisConnection)(config.get("REDIS_URL"), config.get("REDIS_PASSWORD"))
                    };
                }
            })
        ],
        controllers: [
            _coursesadmincontroller.CoursesAdminController
        ],
        providers: [
            _reviewcoursehandler.ReviewCourseHandler,
            _sendcoursereviewhandler.SendCourseReviewEmailHandler,
            _rolesguard.RolesGuard
        ],
        exports: [
            _sendcoursereviewhandler.SendCourseReviewEmailHandler
        ]
    })
], CoursesModule);

//# sourceMappingURL=courses.module.js.map