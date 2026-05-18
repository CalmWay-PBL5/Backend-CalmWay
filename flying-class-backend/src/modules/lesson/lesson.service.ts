import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentType } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

const lessonSelect = {
  id: true,
  class_id: true,
  title: true,
  content_type: true,
  url: true,
  body_text: true,
  order_index: true,
  ai_summary_text: true,
  ai_keywords: true,
  created_at: true,
  updated_at: true,
  class: {
    select: {
      id: true,
      title: true,
      class_code: true,
    },
  },
} as const;

const normalizeContentType = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  if (normalized === ContentType.DOCUMENT) return ContentType.DOCUMENT;
  if (normalized === ContentType.CLOUD_DOC) return ContentType.CLOUD_DOC;
  if (normalized === ContentType.TEXT) return ContentType.TEXT;
  return ContentType.VIDEO;
};

const toLessonResponse = (lesson: (typeof lessonSelect) & { class?: any }) => ({
  id: lesson.id,
  classId: lesson.class_id,
  title: lesson.title,
  contentType: lesson.content_type as unknown as ContentType,
  url: lesson.url,
  bodyText: lesson.body_text,
  orderIndex: lesson.order_index,
  aiSummaryText: lesson.ai_summary_text,
  aiKeywords: lesson.ai_keywords,
  createdAt: lesson.created_at,
  updatedAt: lesson.updated_at,
  class: lesson.class
    ? {
        id: lesson.class.id,
        title: lesson.class.title,
        classCode: lesson.class.class_code,
      }
    : null,
});

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  private get lessonDelegate() {
    return (this.prisma as any).lesson;
  }

  findAll() {
    return this.lessonDelegate
      .findMany({
        select: lessonSelect,
        orderBy: [{ class_id: "asc" }, { order_index: "asc" }],
      })
      .then((lessons: any[]) => lessons.map((lesson) => toLessonResponse(lesson)));
  }

  async findOne(id: string) {
    const lesson = await this.lessonDelegate.findUnique({
      where: { id },
      select: lessonSelect,
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${id} not found`);
    }

    return toLessonResponse(lesson as any);
  }

  async create(dto: CreateLessonDto) {
    try {
      const lesson = await this.lessonDelegate.create({
        data: {
          class_id: dto.classId,
          title: dto.title,
          content_type: normalizeContentType(dto.contentType),
          url: dto.url,
          body_text: dto.bodyText,
          order_index: dto.orderIndex,
          ai_summary_text: dto.aiSummaryText,
          ai_keywords: dto.aiKeywords,
        },
        select: lessonSelect,
      });
      return toLessonResponse(lesson as any);
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.ensureLessonExists(id);

    try {
      const lesson = await this.lessonDelegate.update({
        where: { id },
        data: {
          class_id: dto.classId,
          title: dto.title,
          content_type: dto.contentType
            ? normalizeContentType(dto.contentType)
            : undefined,
          url: dto.url,
          body_text: dto.bodyText,
          order_index: dto.orderIndex,
          ai_summary_text: dto.aiSummaryText,
          ai_keywords: dto.aiKeywords,
        },
        select: lessonSelect,
      });
      return toLessonResponse(lesson as any);
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
