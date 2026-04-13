"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthModule", {
    enumerable: true,
    get: function() {
        return AuthModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _bullmq = require("@nestjs/bullmq");
const _jwt = require("@nestjs/jwt");
const _passport = require("@nestjs/passport");
const _registercontroller = require("./register/register.controller");
const _registerhandler = require("./register/register.handler");
const _authprocessor = require("./workers/auth.processor");
const _sendregisteremailhandler = require("./workers/handlers/send-register-email.handler");
const _verifyemailcontroller = require("./verify-email/verify-email.controller");
const _verifyemailhandler = require("./verify-email/verify-email.handler");
const _appconfigservice = require("../../core/config/app-config.service");
const _logincontroller = require("./login/login.controller");
const _loginhandler = require("./login/login.handler");
const _jwtstrategy = require("./strategies/jwt.strategy");
const _refreshcontroller = require("./refresh/refresh.controller");
const _refreshhandler = require("./refresh/refresh.handler");
const _jwtrefreshstrategy = require("./strategies/jwt-refresh.strategy");
const _logoutcontroller = require("./logout/logout.controller");
const _logouthandler = require("./logout/logout.handler");
const _forgotpasswordcontroller = require("./forgot-password/forgot-password.controller");
const _forgotpasswordhandler = require("./forgot-password/forgot-password.handler");
const _resetpasswordcontroller = require("./reset-password/reset-password.controller");
const _resetpasswordhandler = require("./reset-password/reset-password.handler");
const _sendpasswordresetemailhandler = require("./workers/handlers/send-password-reset-email.handler");
const _rolesguard = require("./guards/roles.guard");
const _sendkycresultemailhandler = require("../kyc/workers/handlers/send-kyc-result-email.handler");
const _sendcoursereviewhandler = require("../courses/workers/handlers/send-course-review.handler");
const _redisconnectionutil = require("../../infrastructure/redis/redis-connection.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const CommandHandlers = [
    _registerhandler.RegisterHandler,
    _verifyemailhandler.VerifyEmailHandler,
    _loginhandler.LoginHandler,
    _refreshhandler.RefreshHandler,
    _logouthandler.LogoutHandler,
    _forgotpasswordhandler.ForgotPasswordHandler,
    _resetpasswordhandler.ResetPasswordHandler
];
const BackgroundWorkers = [
    _authprocessor.AuthProcessor,
    _sendregisteremailhandler.SendRegisterEmailHandler,
    _sendpasswordresetemailhandler.SendPasswordResetEmailHandler,
    _sendkycresultemailhandler.SendKycResultEmailHandler,
    _sendcoursereviewhandler.SendCourseReviewEmailHandler
];
const Strategies = [
    _jwtstrategy.JwtStrategy,
    _jwtrefreshstrategy.JwtRefreshStrategy
];
const Guards = [
    _rolesguard.RolesGuard
];
let AuthModule = class AuthModule {
};
AuthModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule,
            _passport.PassportModule.register({
                defaultStrategy: "jwt"
            }),
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
            }),
            _jwt.JwtModule.registerAsync({
                inject: [
                    _appconfigservice.AppConfigService
                ],
                useFactory: (config)=>({
                        secret: config.get("JWT_SECRET"),
                        signOptions: {
                            expiresIn: "1d"
                        }
                    })
            })
        ],
        controllers: [
            _registercontroller.RegisterController,
            _verifyemailcontroller.VerifyEmailController,
            _logincontroller.LoginController,
            _refreshcontroller.RefreshController,
            _logoutcontroller.LogoutController,
            _forgotpasswordcontroller.ForgotPasswordController,
            _resetpasswordcontroller.ResetPasswordController
        ],
        providers: [
            ...CommandHandlers,
            ...BackgroundWorkers,
            ...Strategies,
            ...Guards
        ]
    })
], AuthModule);

//# sourceMappingURL=auth.module.js.map