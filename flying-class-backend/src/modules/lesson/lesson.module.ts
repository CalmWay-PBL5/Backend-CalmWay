import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
