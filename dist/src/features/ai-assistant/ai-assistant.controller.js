"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AiAssistantController", {
    enumerable: true,
    get: function() {
        return AiAssistantController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _enterprisefilepipe = require("../../shared/file-upload/enterprise-file.pipe");
const _chatcommand = require("./chat/chat.command");
const _listmodelsquery = require("./models/list-models.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let AiAssistantController = class AiAssistantController {
    async listModels() {
        return await this.queryBus.execute(new _listmodelsquery.ListAssistantModelsQuery());
    }
    async chat(req) {
        const { message, file } = await this.extractPayload(req);
        return await this.commandBus.execute(new _chatcommand.ChatWithAssistantCommand(message, file));
    }
    async extractPayload(req) {
        const isMultipart = typeof req.isMultipart === "function" ? req.isMultipart() : false;
        if (isMultipart) {
            return await this.extractMultipartPayload(req);
        }
        const message = String(req.body?.message ?? "").trim();
        if (!message) {
            throw new _common.BadRequestException("Message không được để trống.");
        }
        return {
            message,
            file: undefined
        };
    }
    async extractMultipartPayload(req) {
        const iterator = req.parts?.();
        if (!iterator) {
            throw new _common.BadRequestException("Yêu cầu upload không hợp lệ.");
        }
        let message = "";
        let file;
        for await (const part of iterator){
            if (part.type === "field" && part.fieldname === "message") {
                message = String(part.value ?? "").trim();
                continue;
            }
            if (part.type === "file" && part.fieldname === "file") {
                if (file) {
                    throw new _common.BadRequestException("Chỉ được gửi tối đa 1 tệp đính kèm.");
                }
                const buffer = await part.toBuffer();
                file = this.attachmentPipe.transform(this.toExpressFile(part, buffer));
                continue;
            }
            if (part.type === "file") {
                await part.toBuffer();
            }
        }
        if (!message) {
            throw new _common.BadRequestException("Message không được để trống.");
        }
        return {
            message,
            file
        };
    }
    toExpressFile(multipartFile, buffer) {
        return {
            fieldname: multipartFile.fieldname || "file",
            originalname: multipartFile.filename || "upload.bin",
            encoding: multipartFile.encoding || "7bit",
            mimetype: multipartFile.mimetype || "application/octet-stream",
            size: buffer.length,
            buffer,
            destination: "",
            filename: multipartFile.filename || "upload.bin",
            path: "",
            stream: multipartFile.file
        };
    }
    constructor(commandBus, queryBus){
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.attachmentPipe = new _enterprisefilepipe.EnterpriseFilePipe("AI_ASSISTANT_ATTACHMENT");
    }
};
_ts_decorate([
    (0, _common.Get)("models"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], AiAssistantController.prototype, "listModels", null);
_ts_decorate([
    (0, _common.Post)("chat"),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AiAssistantController.prototype, "chat", null);
AiAssistantController = _ts_decorate([
    (0, _common.Controller)("ai-assistant"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus,
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus
    ])
], AiAssistantController);

//# sourceMappingURL=ai-assistant.controller.js.map