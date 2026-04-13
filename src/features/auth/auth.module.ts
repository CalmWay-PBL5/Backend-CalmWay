import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { BullModule } from "@nestjs/bullmq";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { RegisterController } from "./register/register.controller";
import { RegisterHandler } from "./register/register.handler";
import { AuthProcessor } from "./workers/auth.processor";
import { SendRegisterEmailHandler } from "./workers/handlers/send-register-email.handler";
import { VerifyEmailController } from "./verify-email/verify-email.controller";
import { VerifyEmailHandler } from "./verify-email/verify-email.handler";
import { AppConfigService } from "@/core/config/app-config.service";
import { LoginController } from "./login/login.controller";
import { LoginHandler } from "./login/login.handler";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshController } from "./refresh/refresh.controller";
import { RefreshHandler } from "./refresh/refresh.handler";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { LogoutController } from "./logout/logout.controller";
import { LogoutHandler } from "./logout/logout.handler";
import { ForgotPasswordController } from "./forgot-password/forgot-password.controller";
import { ForgotPasswordHandler } from "./forgot-password/forgot-password.handler";
import { ResetPasswordController } from "./reset-password/reset-password.controller";
import { ResetPasswordHandler } from "./reset-password/reset-password.handler";
import { SendPasswordResetEmailHandler } from "./workers/handlers/send-password-reset-email.handler";
import { RolesGuard } from "./guards/roles.guard";
import { SendKycResultEmailHandler } from "@/features/kyc/workers/handlers/send-kyc-result-email.handler";
import { SendCourseReviewEmailHandler } from "@/features/courses/workers/handlers/send-course-review.handler";
import { parseRedisConnection } from "@/infrastructure/redis/redis-connection.util";

const CommandHandlers = [
  RegisterHandler,
  VerifyEmailHandler,
  LoginHandler,
  RefreshHandler,
  LogoutHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
];
const BackgroundWorkers = [
  AuthProcessor,
  SendRegisterEmailHandler,
  SendPasswordResetEmailHandler,
  SendKycResultEmailHandler,
  SendCourseReviewEmailHandler,
];
const Strategies = [JwtStrategy, JwtRefreshStrategy];
const Guards = [RolesGuard];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    BullModule.registerQueueAsync({
      name: "auth-queue",
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        return {
          connection: parseRedisConnection(
            config.get("REDIS_URL"),
            config.get("REDIS_PASSWORD"),
          ),
        };
      },
    }),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.get("JWT_SECRET"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
  ],
  controllers: [
    RegisterController,
    VerifyEmailController,
    LoginController,
    RefreshController,
    LogoutController,
    ForgotPasswordController,
    ResetPasswordController,
  ],
  providers: [...CommandHandlers, ...BackgroundWorkers, ...Strategies, ...Guards],
})
export class AuthModule {}
