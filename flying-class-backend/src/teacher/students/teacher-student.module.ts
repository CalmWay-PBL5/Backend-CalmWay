import { Module } from '@nestjs/common';
import { TeacherStudentController } from './teacher-student.controller';
import { TeacherStudentService } from './teacher-student.service';
import { TeacherStudentExportService } from './teacher-student-export.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [TeacherStudentController],
  providers: [TeacherStudentService, TeacherStudentExportService],
  exports: [TeacherStudentService, TeacherStudentExportService],
})
export class TeacherStudentModule {}
