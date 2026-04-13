import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassMemberStatus, ClassStatus, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetClassChatHistoryQuery } from "./get-class-chat-history.query";

@QueryHandler(GetClassChatHistoryQuery)
export class GetClassChatHistoryHandler
  implements IQueryHandler<GetClassChatHistoryQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetClassChatHistoryQuery) {
    await this.assertCanAccessClass(query.actorId, query.classId);

    const history = await this.prisma.chatMessage.findMany({
      where: {
        class_id: query.classId,
      },
      orderBy: {
        created_at: "asc",
      },
      take: query.take,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                full_name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return history.map((item) => ({
      id: item.id,
      classId: item.class_id,
      senderId: item.sender_id,
      content: item.content,
      createdAt: item.created_at,
      sender: {
        id: item.sender.id,
        email: item.sender.email,
        fullName: item.sender.profile?.full_name || null,
        avatar: item.sender.profile?.avatar || null,
      },
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

    throw new ForbiddenException("Bạn không có quyền xem chat của lớp học này.");
  }
}
