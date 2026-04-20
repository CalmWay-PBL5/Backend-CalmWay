import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Patch, 
  Delete,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateCloudDocDto } from './dto/create-cloud-doc.dto';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('cloud-doc')
  async createCloudDoc(@Body() dto: CreateCloudDocDto) {
    return this.lessonService.createCloudDocument(dto);
  }

  @Get('class/:classId/cloud-docs')
  async getCloudDocs(@Param('classId') classId: string) {
    return this.lessonService.getCloudDocumentsByClass(classId);
  }

  @Patch(':id/title')
  async updateTitle(
    @Param('id') id: string, 
    @Body('title') title: string
  ) {
    return this.lessonService.updateTitle(id, title);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.lessonService.delete(id);
  }
}