import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassMemberStatus, ClassStatus, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { SendClassMessageCommand } from "./send-class-message.command";

@CommandHandler(SendClassMessageCommand)
export class SendClassMessageHandler
  implements ICommandHandler<SendClassMessageCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SendClassMessageCommand) {
    const content = command.content?.trim();
    if (!content) {
      throw new BadRequestException("Nội dung tin nhắn không được để trống.");
    }

    await this.assertCanAccessClass(command.actorId, command.classId);

    const saved = await this.prisma.chatMessage.create({
      data: {
        class_id: command.classId,
        sender_id: command.actorId,
        content,
      },
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

    return {
      id: saved.id,
      classId: saved.class_id,
      senderId: saved.sender_id,
      content: saved.content,
      createdAt: saved.created_at,
      sender: {
        id: saved.sender.id,
        email: saved.sender.email,
        fullName: saved.sender.profile?.full_name || null,
        avatar: saved.sender.profile?.avatar || null,
      },
    };
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

    throw new ForbiddenException("Bạn không có quyền gửi tin nhắn trong lớp học này.");
  }
}
