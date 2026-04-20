import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

/**
 * Service xử lý chat với Google Gemini API
 */
@Injectable()
export class AiAssistantService {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor(private readonly configService: ConfigService) {
    // 1. Lấy API key từ file .env thông qua ConfigService
    const key = this.configService.get<string>('GEMINI_API_KEY');
    
    // 2. Bắt lỗi ngay lúc khởi động server nếu lỡ quên không điền key
    if (!key) {
      throw new Error('CRITICAL ERROR: Thiếu biến môi trường GEMINI_API_KEY trong file .env');
    }

    this.apiKey = key;
    // 3. Khởi tạo Google Generative AI client
    this.genAI = new GoogleGenerativeAI(this.apiKey);
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

      // 1. Khởi tạo model chuẩn (sử dụng gemini-2.5-flash theo danh sách hỗ trợ)
      const model = this.genAI.getGenerativeModel({
        model: '	gemini-3.1-flash-lite-preview', 
        systemInstruction: 'Bạn là trợ lý ảo của Flying Class. Trả lời ngắn gọn, thân thiện.',
      });

      // 2. Chuẩn bị nội dung
      const parts: any[] = [{ text: message }];

      if (file) {
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString('base64'),
          },
        });
      }

      console.log(`[AiAssistantService] Đang gọi Gemini...`);
      const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
      
      const response = await result.response;
      return response.text();

    } catch (error: any) {
      // IN RA LỖI GỐC ĐỂ DEBUG
      console.error('[AiAssistantService] FULL ERROR TỪ GOOGLE:', error); 
      
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
      // Gọi trực tiếp REST API bằng fetch thay vì dùng hàm không tồn tại của SDK
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google API trả về mã lỗi: ${response.status}`);
      }

      const data = await response.json();
      
      // Lấy ra danh sách tên model
      const modelNames = data.models.map((model: any) => model.name);
      console.log(`[AiAssistantService] Đã lấy được ${modelNames.length} models.`);
      
      return modelNames;
    } catch (error: any) {
      console.error('[AiAssistantService] Lỗi lấy danh sách models:', error.message);
      throw new InternalServerErrorException(`Không thể lấy danh sách models: ${error.message}`);
    }
  }
}