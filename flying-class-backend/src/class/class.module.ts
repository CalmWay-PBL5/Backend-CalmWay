import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { ClassExportService } from './class-export.service';
// Lưu ý: Sửa lại đường dẫn import PrismaModule cho đúng với cấu trúc thư mục của bạn
import { PrismaModule } from '../infrastructure/database/prisma/prisma.module'; 

@Module({
  imports: [PrismaModule], // <-- Bắt buộc phải thêm dòng này để gọi được Prisma
  controllers: [ClassController],
  providers: [ClassService, ClassExportService],
})
export class ClassModule {}