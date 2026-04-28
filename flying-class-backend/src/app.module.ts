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
import { UserModule } from './modules/user/user.module';
import { SubjectModule } from './modules/subject/subject.module';
import { ClassModule } from './modules/class/class.module';
import { LessonModule } from './modules/lesson/lesson.module';

@Module({
  imports: [
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
              ? undefined // In production, output raw JSON for Datadog/CloudWatch
              : {
                  target: 'pino-pretty', // In development, format JSON beautifully for your terminal
                  options: {
                    singleLine: false,
                    colorize: true,
                  },
                },
            
            autoLogging: true, // Automatically log request/response
          },
        };
      },
    }),
    TerminusModule,
    InfrastructureModule,
    UserModule,
    SubjectModule,
    ClassModule,
    LessonModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
