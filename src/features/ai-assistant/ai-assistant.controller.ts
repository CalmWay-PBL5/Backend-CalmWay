import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EnterpriseFilePipe } from "@/shared/file-upload/enterprise-file.pipe";
import { ChatWithAssistantCommand } from "./chat/chat.command";
import { ListAssistantModelsQuery } from "./models/list-models.query";

@Controller("ai-assistant")
@UseGuards(JwtAuthGuard)
export class AiAssistantController {
  private readonly attachmentPipe = new EnterpriseFilePipe(
    "AI_ASSISTANT_ATTACHMENT",
  );

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get("models")
  async listModels() {
    return await this.queryBus.execute(new ListAssistantModelsQuery());
  }

  @Post("chat")
  @HttpCode(HttpStatus.OK)
  async chat(@Req() req: any) {
    const { message, file } = await this.extractPayload(req);

    return await this.commandBus.execute(
      new ChatWithAssistantCommand(message, file),
    );
  }

  private async extractPayload(req: any) {
    const isMultipart =
      typeof req.isMultipart === "function" ? req.isMultipart() : false;

    if (isMultipart) {
      return await this.extractMultipartPayload(req);
    }

    const message = String(req.body?.message ?? "").trim();
    if (!message) {
      throw new BadRequestException("Message không được để trống.");
    }

    return { message, file: undefined as Express.Multer.File | undefined };
  }

  private async extractMultipartPayload(req: any) {
    const iterator = req.parts?.();
    if (!iterator) {
      throw new BadRequestException("Yêu cầu upload không hợp lệ.");
    }

    let message = "";
    let file: Express.Multer.File | undefined;

    for await (const part of iterator) {
      if (part.type === "field" && part.fieldname === "message") {
        message = String(part.value ?? "").trim();
        continue;
      }

      if (part.type === "file" && part.fieldname === "file") {
        if (file) {
          throw new BadRequestException("Chỉ được gửi tối đa 1 tệp đính kèm.");
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
      throw new BadRequestException("Message không được để trống.");
    }

    return { message, file };
  }

  private toExpressFile(
    multipartFile: any,
    buffer: Buffer,
  ): Express.Multer.File {
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
      stream: multipartFile.file,
    };
  }
}
