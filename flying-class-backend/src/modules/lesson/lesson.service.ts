import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

const lessonSelect = {
  id: true,
  classId: true,
  title: true,
  contentType: true,
  url: true,
  bodyText: true,
  orderIndex: true,
  aiSummaryText: true,
  aiKeywords: true,
  createdAt: true,
  updatedAt: true,
  class: {
    select: {
      id: true,
      title: true,
      classCode: true,
    },
  },
} as const;

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  private get lessonDelegate() {
    return (this.prisma as any).lesson;
  }

  findAll() {
    return this.lessonDelegate.findMany({
      select: lessonSelect,
      orderBy: [{ classId: 'asc' }, { orderIndex: 'asc' }],
    });
  }

  async findOne(id: string) {
    const lesson = await this.lessonDelegate.findUnique({
      where: { id },
      select: lessonSelect,
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${id} not found`);
    }

    return lesson;
  }

  async create(dto: CreateLessonDto) {
    try {
      return await this.lessonDelegate.create({
        data: {
          classId: dto.classId,
          title: dto.title,
          contentType: dto.contentType,
          url: dto.url,
          bodyText: dto.bodyText,
          orderIndex: dto.orderIndex,
          aiSummaryText: dto.aiSummaryText,
          aiKeywords: dto.aiKeywords,
        },
        select: lessonSelect,
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.ensureLessonExists(id);

    try {
      return await this.lessonDelegate.update({
        where: { id },
        data: {
          classId: dto.classId,
          title: dto.title,
          contentType: dto.contentType,
          url: dto.url,
          bodyText: dto.bodyText,
          orderIndex: dto.orderIndex,
          aiSummaryText: dto.aiSummaryText,
          aiKeywords: dto.aiKeywords,
        },
        select: lessonSelect,
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.ensureLessonExists(id);

    await this.lessonDelegate.delete({ where: { id } });

    return {
      message: 'Lesson deleted successfully',
    };
  }

  private async ensureLessonExists(id: string): Promise<void> {
    const lesson = await this.lessonDelegate.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${id} not found`);
    }
  }

  private handlePrismaError(error: unknown): never | void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      throw new ConflictException('Lesson with unique field already exists');
    }
  }
}
