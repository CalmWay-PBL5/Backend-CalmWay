import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [ChatController], // Bắt buộc phải thêm dòng này
  providers: [ChatGateway, ChatService, PrismaService], // Phải khai báo thêm ChatService
})
export class ChatModule {}