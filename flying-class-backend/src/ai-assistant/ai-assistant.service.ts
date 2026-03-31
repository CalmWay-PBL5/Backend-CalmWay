import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Service xử lý chat với Google Gemini API
 * LƯU Ý: API Key đang được gắn cứng cho mục đích test cục bộ
 * TODO: Trong production, chuyển sang sử dụng ConfigService
 */
@Injectable()
export class AiAssistantService {
  // ⚠️ HARDCODED API KEY - CHỉ cho TEST LOCAL
  // ⚠️ Thay 'YOUR_API_KEY_HERE' bằng API key thực của bạn
  private readonly GEMINI_API_KEY = 'AIzaSyC4-f32vA4lFrk4DsA7fXMcZrg5-syOKl8';

  private genAI: GoogleGenerativeAI;

  constructor() {
    // Khởi tạo Google Generative AI client
    this.genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);
  }

  /**
   * Gửi message + file (optional) lên Gemini API và nhận response
   * @param message - Tin nhắn từ người dùng
   * @param file - File (ảnh, PDF, v.v) - tùy chọn
   * @returns Text response từ Gemini AI
   */
 async generateChatResponse(message: string, file?: Express.Multer.File): Promise<string> {
    try {
      if (!message || message.trim().length === 0) {
        throw new BadRequestException('Message không được để trống');
      }

      // 1. Lấy model với cấu hình ĐÚNG (Ép dùng v1)
      const model = this.genAI.getGenerativeModel(
        {
          model: 'gemini-1.5-flash-latest', // Dùng bản flash cho nhanh và hỗ trợ file + systemInstruction
        },
        { apiVersion: 'v1' }, // 🔥 Ép dùng bản chính thức v1, bỏ qua v1beta hay bị lỗi 404
      );

      // 2. Chuẩn bị mảng nội dung
      const parts: any[] = [{ text: message }];

      // 3. Nếu có file, thêm vào dưới dạng inlineData
      if (file) {
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString('base64'),
          },
        });
      }

      // 4. Thiết lập System Instruction qua Content (Cách này ổn định hơn)
      // Lưu ý: Nếu vẫn lỗi 404, hãy thử xóa đoạn chat bên dưới và chỉ để model.generateContent(parts)
      const promptWithInstruction = 
        `[HỆ THỐNG: Bạn là trợ lý ảo của Flying Class. Trả lời ngắn gọn, thân thiện.]\n\nNgười dùng hỏi: ${message}`;
      
      // Update lại text part đầu tiên bằng prompt có instruction
      parts[0] = { text: promptWithInstruction };

      console.log(`[AiAssistantService] Đang gọi Gemini v1...`);
      const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
      
      const response = await result.response;
      return response.text();

    } catch (error: any) {
      console.error('[AiAssistantService] Error:', error.message);
      
      // Nếu vẫn báo 404 Not Found, hãy thử đổi model sang 'gemini-1.5-flash-latest'
      if (error.message.includes('404')) {
         throw new InternalServerErrorException(
           'Model chưa sẵn sàng hoặc sai phiên bản. Thử đổi model sang gemini-1.5-flash-latest'
         );
      }
      
      throw new InternalServerErrorException(error.message || 'Lỗi Gemini API');
    }
  }

  /**
   * Liệt kê tất cả các models khả dụng từ Gemini API
   * Dùng để debug xem models nào thực sự supported
   * @returns Danh sách tên models khả dụng
   */
  async listAvailableModels(): Promise<string[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const models = (await (this.genAI as any).listModels()) as any;

      const modelNames: string[] = [];
      for (const model of models.models) {
        modelNames.push(model.name);
        console.log(`[AiAssistantService] Available model: ${model.name}`);
      }

      return modelNames;
    } catch (error) {
      const err = error as Error;
      console.error('[AiAssistantService] Error listing models:', err?.message);
      throw new InternalServerErrorException(
        `Không thể lấy danh sách models: ${err?.message}`,
      );
    }
  }
}
