"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AiAssistantService", {
    enumerable: true,
    get: function() {
        return AiAssistantService;
    }
});
const _common = require("@nestjs/common");
const _appconfigservice = require("../../core/config/app-config.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AiAssistantService = class AiAssistantService {
    async generateChatResponse(message, file) {
        const normalizedMessage = message?.trim();
        if (!normalizedMessage) {
            throw new _common.BadRequestException("Message không được để trống.");
        }
        const parts = [
            {
                text: normalizedMessage
            }
        ];
        if (file) {
            parts.push({
                inline_data: {
                    mime_type: file.mimetype,
                    data: file.buffer.toString("base64")
                }
            });
        }
        const response = await this.callGenerateContent(parts);
        const reply = this.extractTextResponse(response);
        if (!reply) {
            throw new _common.InternalServerErrorException("Gemini trả về phản hồi rỗng.");
        }
        return reply;
    }
    async listAvailableModels() {
        const apiKey = this.config.get("GEMINI_API_KEY");
        const response = await fetch(`${this.baseUrl}/models`, {
            method: "GET",
            headers: {
                "x-goog-api-key": apiKey
            }
        });
        const payload = await response.json().catch(()=>null);
        if (!response.ok) {
            const message = payload?.error?.message || `Không thể lấy models từ Gemini (HTTP ${response.status}).`;
            throw new _common.InternalServerErrorException(message);
        }
        const models = payload?.models ?? [];
        return models.filter((model)=>model.supportedGenerationMethods?.includes("generateContent")).map((model)=>model.name ?? "").filter((name)=>name.length > 0);
    }
    async callGenerateContent(parts) {
        const apiKey = this.config.get("GEMINI_API_KEY");
        const response = await fetch(`${this.baseUrl}/models/${this.modelName}:generateContent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [
                        {
                            text: "Bạn là trợ lý ảo của Flying Class. Trả lời ngắn gọn, rõ ràng và thân thiện."
                        }
                    ]
                },
                contents: [
                    {
                        role: "user",
                        parts
                    }
                ]
            })
        });
        const payload = await response.json().catch(()=>null);
        if (!response.ok) {
            const message = payload?.error?.message || `Gemini API lỗi (HTTP ${response.status}).`;
            this.logger.error(`Gemini request failed: ${message}`);
            if (response.status >= 400 && response.status < 500) {
                throw new _common.BadRequestException(message);
            }
            throw new _common.InternalServerErrorException(message);
        }
        return payload;
    }
    extractTextResponse(payload) {
        if (!payload?.candidates?.length) {
            return "";
        }
        return payload.candidates.flatMap((candidate)=>candidate.content?.parts ?? []).map((part)=>part.text?.trim() ?? "").filter((text)=>text.length > 0).join("\n");
    }
    constructor(config){
        this.config = config;
        this.logger = new _common.Logger(AiAssistantService.name);
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
        this.modelName = "gemini-3.1-flash-lite-preview";
    }
};
AiAssistantService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], AiAssistantService);

//# sourceMappingURL=ai-assistant.service.js.map