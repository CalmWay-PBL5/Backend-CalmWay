import { Module } from '@nestjs/common';
import { TeacherProfileModule } from './profile/teacher.module';
import { TeacherStudentModule } from './students/teacher-student.module';

@Module({
  imports: [TeacherProfileModule, TeacherStudentModule],
  exports: [TeacherProfileModule, TeacherStudentModule],
})
export class TeacherModule {}
