import { Controller, Post, Get, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiAssistantService } from './ai-assistant.service';

/**
 * Controller xử lý các request liên quan đến AI Assistant
 */
@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  /**
   * Endpoint GET /api/v1/ai-assistant/models
   * List tất cả models khả dụng (dùng để debug)
   * @returns Danh sách models
   */
  @Get('models')
  async listModels() {
    const models = await this.aiAssistantService.listAvailableModels();
    return {
      status: 'success',
      data: {
        models,
      },
    };
  }

  /**
   * Endpoint POST /api/v1/ai-assistant/chat
   * Nhận multipart/form-data: message (text) + file (optional)
   * Trả về response từ Gemini AI
   *
   * @param message - Tin nhắn từ người dùng (required)
   * @param file - File ảnh, PDF, v.v (optional)
   * @returns Đối tượng chứa status và data (reply)
   *
   * @example
   * POST /api/v1/ai-assistant/chat
   * Content-Type: multipart/form-data
   * Form Data:
   *   - message: "Phân tích ảnh này cho tôi"
   *   - file: [binary image data]
   *
   * Response: {
   *   "status": "success",
   *   "data": {
   *     "reply": "Ảnh này cho thấy..."
   *   }
   * }
   */
  @Post('chat')
  @UseInterceptors(FileInterceptor('file'))
  async chat(
    @Body('message') message: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Gọi service để xử lý message và file (nếu có)
    const reply = await this.aiAssistantService.generateChatResponse(message, file);

    // Trả về format chuẩn
    return {
      status: 'success',
      data: {
        reply,
      },
    };
  }
}
