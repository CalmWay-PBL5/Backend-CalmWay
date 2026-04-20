import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TeacherModule } from './teacher/teacher.module'; 
import { ClassModule } from './class/class.module';
import { ClassMemberModule } from './class-member/class-member.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { ChatModule } from './chat/chat.module';
import { RevenueModule } from './teacher/revenue/revenue.module'; // Import RevenueModule vào đây
import { LessonModule } from './lesson/lesson.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const isProduction = config.get('app.nodeEnv') === 'production';
        
        return {
          forRoutes: ['*path'], 

          pinoHttp: {
            genReqId: (request) => request.headers['x-request-id'] || randomUUID(),
            
            level: isProduction ? 'info' : 'debug',
            transport: isProduction
              ? undefined 
              : {
                  target: 'pino-pretty', 
                  options: {
                    singleLine: false,
                    colorize: true,
                  },
                },
            
            autoLogging: true, 
          },
        };
      },
    }),
    TerminusModule,
    InfrastructureModule,
    TeacherModule,
    ClassModule,
    ClassMemberModule,
    AiAssistantModule,
    ChatModule,
    RevenueModule,
    LessonModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}