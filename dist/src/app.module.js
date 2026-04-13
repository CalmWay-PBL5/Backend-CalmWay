"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _coremodule = require("./core/core.module");
const _infrastructuremodule = require("./infrastructure/infrastructure.module");
const _authmodule = require("./features/auth/auth.module");
const _sharedmodule = require("./shared/shared.module");
const _kycmodule = require("./features/kyc/kyc.module");
const _usersmodule = require("./features/users/users.module");
const _coursesmodule = require("./features/courses/courses.module");
const _financemodule = require("./features/finance/finance.module");
const _systemmodule = require("./features/system/system.module");
const _aiassistantmodule = require("./features/ai-assistant/ai-assistant.module");
const _teachermodule = require("./features/teacher/teacher.module");
const _lessonsmodule = require("./features/lessons/lessons.module");
const _chatmodule = require("./features/chat/chat.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _coremodule.CoreModule,
            _infrastructuremodule.InfrastructureModule,
            _authmodule.AuthModule,
            _sharedmodule.SharedModule,
            _kycmodule.KycModule,
            _usersmodule.UsersModule,
            _coursesmodule.CoursesModule,
            _financemodule.FinanceModule,
            _systemmodule.SystemModule,
            _aiassistantmodule.AiAssistantModule,
            _teachermodule.TeacherModule,
            _lessonsmodule.LessonsModule,
            _chatmodule.ChatModule
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map