import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('classes') // Mình gắn luôn vào URL /classes để chuẩn RESTful
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // API: GET /api/v1/classes/:classId/chat-history
  @Get(':classId/chat-history')
  async getChatHistory(@Param('classId') classId: string) {
    return this.chatService.getChatHistory(classId);
  }
}