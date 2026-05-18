import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassMemberStatus, ClassStatus, ContentType, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ListClassCloudDocsQuery } from "./list-cloud-docs.query";

@QueryHandler(ListClassCloudDocsQuery)
export class ListCloudDocsHandler implements IQueryHandler<ListClassCloudDocsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListClassCloudDocsQuery) {
    await this.assertCanAccessClass(query.actorId, query.classId);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        class_id: query.classId,
        content_type: ContentType.CLOUD_DOC,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return lessons.map((lesson) => ({
      id: lesson.id,
      classId: lesson.class_id,
      title: lesson.title,
      url: lesson.url,
      contentType: lesson.content_type,
      orderIndex: lesson.order_index,
      metadata: this.safeParseMetadata(lesson.body_text),
      createdAt: lesson.created_at,
      updatedAt: lesson.updated_at,
    }));
  }

  private async assertCanAccessClass(userId: string, classId: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, teacher_id: true, status: true },
    });

    if (!classItem || classItem.status !== ClassStatus.ACTIVE) {
      throw new NotFoundException("Không tìm thấy lớp học.");
    }

    if (classItem.teacher_id === userId) {
      return;
    }

    const member = await this.prisma.classMember.findUnique({
      where: {
        class_id_student_id: {
          class_id: classId,
          student_id: userId,
        },
      },
      select: { status: true },
    });

    if (member?.status === ClassMemberStatus.ACTIVE) {
      return;
    }

    const fallbackByTransaction = await this.prisma.transaction.findFirst({
      where: {
        class_id: classId,
        user_id: userId,
        status: TransactionStatus.SUCCESS,
      },
      select: { id: true },
    });

    if (fallbackByTransaction) {
      return;
    }

    throw new ForbiddenException("Bạn không có quyền xem tài liệu của lớp học này.");
  }

  private safeParseMetadata(raw?: string | null) {
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
