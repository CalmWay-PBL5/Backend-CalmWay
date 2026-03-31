import { Module } from '@nestjs/common';
import { TeacherProfileController } from './teacher-profile.controller';
import { TeacherProfileService } from './teacher-profile.service';
// 1. Import InfrastructureModule - nơi chứa PrismaService của bạn
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  // 2. Thêm InfrastructureModule vào mảng imports
  imports: [InfrastructureModule], 
  controllers: [TeacherProfileController],
  providers: [TeacherProfileService],
})
export class TeacherProfileModule {}