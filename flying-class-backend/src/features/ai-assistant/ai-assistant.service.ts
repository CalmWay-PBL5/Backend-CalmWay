import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { AppConfigService } from "@/core/config/app-config.service";

type GeminiInlineData = {
  mime_type: string;
  data: string;
};

type GeminiContentPart =
  | {
      text: string;
    }
  | {
      inline_data: GeminiInlineData;
    };

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  private readonly modelName = "gemini-3.1-flash-lite-preview";

  constructor(private readonly config: AppConfigService) {}

  async generateChatResponse(
    message: string,
    file?: Express.Multer.File,
  ): Promise<string> {
    const normalizedMessage = message?.trim();
    if (!normalizedMessage) {
      throw new BadRequestException("Message không được để trống.");
    }

    const parts: GeminiContentPart[] = [{ text: normalizedMessage }];

    if (file) {
      parts.push({
        inline_data: {
          mime_type: file.mimetype,
          data: file.buffer.toString("base64"),
        },
      });
    }

    const response = await this.callGenerateContent(parts);
    const reply = this.extractTextResponse(response);

    if (!reply) {
      throw new InternalServerErrorException("Gemini trả về phản hồi rỗng.");
    }

    return reply;
  }

  async listAvailableModels(): Promise<string[]> {
    const apiKey = this.config.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new InternalServerErrorException("Thiếu cấu hình GEMINI_API_KEY.");
    }
    const response = await fetch(`${this.baseUrl}/models`, {
      method: "GET",
      headers: {
        "x-goog-api-key": apiKey,
      },
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        `Không thể lấy models từ Gemini (HTTP ${response.status}).`;
      throw new InternalServerErrorException(message);
    }

    const models: Array<{
      name?: string;
      supportedGenerationMethods?: string[];
    }> = payload?.models ?? [];

    return models
      .filter((model) =>
        model.supportedGenerationMethods?.includes("generateContent"),
      )
      .map((model) => model.name ?? "")
      .filter((name) => name.length > 0);
  }

  private async callGenerateContent(parts: GeminiContentPart[]) {
    const apiKey = this.config.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new InternalServerErrorException("Thiếu cấu hình GEMINI_API_KEY.");
    }
    const response = await fetch(
      `${this.baseUrl}/models/${this.modelName}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: "Bạn là trợ lý ảo của Flying Class. Trả lời ngắn gọn, rõ ràng và thân thiện.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts,
            },
          ],
        }),
      },
    );

    const payload = (await response
      .json()
      .catch(() => null)) as GeminiGenerateResponse | null;

    if (!response.ok) {
      const message =
        payload?.error?.message || `Gemini API lỗi (HTTP ${response.status}).`;
      this.logger.error(`Gemini request failed: ${message}`);

      if (response.status >= 400 && response.status < 500) {
        throw new BadRequestException(message);
      }

      throw new InternalServerErrorException(message);
    }

    return payload;
  }

  private extractTextResponse(payload: GeminiGenerateResponse | null) {
    if (!payload?.candidates?.length) {
      return "";
    }

    return payload.candidates
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text?.trim() ?? "")
      .filter((text) => text.length > 0)
      .join("\n");
  }
}
