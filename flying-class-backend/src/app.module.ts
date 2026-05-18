import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { AppController } from "./app.controller";
import { CoreModule } from "./core/core.module";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { PrismaModule } from "./infrastructure/database/prisma/prisma.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { AuthModule } from "./features/auth/auth.module";
import { SharedModule } from "./shared/shared.module";
import { KycModule } from "./features/kyc/kyc.module";
import { UsersModule } from "./features/users/users.module";
import { CoursesModule } from "./features/courses/courses.module";
import { FinanceModule } from "./features/finance/finance.module";
import { SystemModule } from "./features/system/system.module";
import { AiAssistantModule } from "./features/ai-assistant/ai-assistant.module";
import { TeacherModule } from "./features/teacher/teacher.module";
import { LessonsModule } from "./features/lessons/lessons.module";
import { ChatModule } from "./features/chat/chat.module";
import { UserModule } from "./modules/user/user.module";
import { SubjectModule } from "./modules/subject/subject.module";
import { ClassModule } from "./modules/class/class.module";
import { LessonModule } from "./modules/lesson/lesson.module";

@Module({
  imports: [
    CoreModule,
    InfrastructureModule,
    TerminusModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    SharedModule,
    KycModule,
    UsersModule,
    CoursesModule,
    FinanceModule,
    SystemModule,
    AiAssistantModule,
    TeacherModule,
    LessonsModule,
    ChatModule,
    UserModule,
    SubjectModule,
    ClassModule,
    LessonModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
