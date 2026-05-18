import {
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { DeleteClassMessageCommand } from "./delete-class-message.command";

@CommandHandler(DeleteClassMessageCommand)
export class DeleteClassMessageHandler
  implements ICommandHandler<DeleteClassMessageCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteClassMessageCommand) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: command.messageId },
      select: {
        id: true,
        class_id: true,
        sender_id: true,
      },
    });

    if (!message || message.class_id !== command.classId) {
      throw new NotFoundException("Tin nhắn không tồn tại.");
    }

    if (message.sender_id !== command.actorId) {
      throw new ForbiddenException("Bạn không có quyền xóa tin nhắn này.");
    }

    await this.prisma.chatMessage.delete({
      where: {
        id: command.messageId,
      },
    });

    return {
      status: "success",
      message: "Đã xóa tin nhắn.",
    };
  }
}
