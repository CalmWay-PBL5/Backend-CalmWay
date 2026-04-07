        import 'reflect-metadata';
        import { NestFactory } from '@nestjs/core';
        import { AppModule } from './app.module';
        import { ConfigService } from '@nestjs/config';
        import { ValidationPipe, VersioningType } from '@nestjs/common';
        import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
        import { Logger } from 'nestjs-pino';

        // 🔥 1. Import thêm join và NestExpressApplication
        import { join } from 'path';
        import { NestExpressApplication } from '@nestjs/platform-express';

        async function bootstrap() {
          // 🔥 2. Ép kiểu app sang NestExpressApplication để dùng được useStaticAssets
          const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

          app.useLogger(app.get(Logger));

          app.setGlobalPrefix('api');

          app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: '1',
          });

          // 🔥 3. Cấu hình phục vụ file tĩnh từ thư mục 'uploads'
          // Đường dẫn: http://localhost:3000/uploads/ten-file.jpg
          app.useStaticAssets(join(__dirname, '..', 'uploads'), {
            prefix: '/uploads/',
          });

          app.useGlobalPipes(
            new ValidationPipe({
              whitelist: true, 
              forbidNonWhitelisted: true, 
              transform: true,
              // Thêm cái này để class-transformer hoạt động (giúp ép kiểu @Type Number)
              transformOptions: { enableImplicitConversion: true }, 
            }),
          );

          app.useGlobalFilters(new GlobalExceptionFilter());

          app.enableShutdownHooks();

          const configService = app.get(ConfigService);
          const port = configService.get<number>('app.port', 3000);
          
          await app.listen(port, '0.0.0.0');
          console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
          console.log(`📁 Static files are served at: http://localhost:${port}/uploads/`);
        }
        bootstrap();