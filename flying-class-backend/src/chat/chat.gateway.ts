import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } }) // Cho phép Frontend gọi tự do
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
 @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`🟢 Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Socket disconnected: ${client.id}`);
  }

  // Frontend báo: "Cho tôi vào Aphòng chat của lớp này"
  @SubscribeMessage('joinClassRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { classId: string; userId: string },
  ) {
    client.join(payload.classId);
    console.log(`User ${payload.userId} đã join phòng: ${payload.classId}`);
  }

  // Frontend báo: "Tôi gửi tin nhắn"
  // Thêm Event này vào ChatGateway
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { classId: string; messageId: string; userId: string },
  ) {
    try {
      // 1. Xóa trong Database
      await this.chatService.deleteMessage(payload.messageId, payload.userId);

      // 2. Phát thanh cho cả phòng biết tin nhắn này đã bị xóa để UI Frontend tự ẩn đi
      this.server.to(payload.classId).emit('messageDeleted', payload.messageId);
      
    } catch (error: any) {
      console.error('Lỗi khi xóa tin nhắn:', error.message);
      client.emit('error', error.message || 'Không thể xóa tin nhắn lúc này');
    }
  }
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { classId: string; senderId: string; content: string },
  ) {
    try {
      // 1. Lưu vào DB
      const savedMessage = await this.chatService.saveMessage(
        payload.classId,
        payload.senderId,
        payload.content,
      );

      // 2. Phát thanh (Broadcast) cho TẤT CẢ mọi người trong phòng
      this.server.to(payload.classId).emit('newMessage', savedMessage);
    } catch (error) {
      console.error('Lỗi khi lưu tin nhắn chat:', error);
      client.emit('error', 'Không thể gửi tin nhắn lúc này');
    }
  }
}