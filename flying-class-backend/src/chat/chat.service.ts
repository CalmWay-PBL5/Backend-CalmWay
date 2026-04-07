import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
// Thêm hàm này vào ChatService
  async deleteMessage(messageId: string, userId: string) {
    // 1. Kiểm tra xem tin nhắn có tồn tại không
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }

    // 2. Chỉ cho phép người gửi mới được xóa tin nhắn của chính họ
    if (message.senderId !== userId) {
      throw new Error('Bạn không có quyền xóa tin nhắn này');
    }

    // 3. Tiến hành xóa
    return this.prisma.chatMessage.delete({
      where: { id: messageId },
    });
  }
  // Lưu tin nhắn mới vào Database
  async saveMessage(classId: string, senderId: string, content: string) {
    return this.prisma.chatMessage.create({
      data: {
        classId,
        senderId,
        content,
      },
      // Lấy kèm thông tin người gửi để Frontend hiển thị tên & avatar
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { fullName: true, avatar: true },
            },
          },
        },
      },
    });
  }

  // Lấy 50 tin nhắn cũ nhất của lớp học
  async getChatHistory(classId: string) {
    return this.prisma.chatMessage.findMany({
      where: { classId },
      orderBy: { createdAt: 'asc' }, // Xếp theo thời gian cũ -> mới
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { fullName: true, avatar: true },
            },
          },
        },
      },
    });
  }
}