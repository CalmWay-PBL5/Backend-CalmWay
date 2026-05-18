import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetClassChatHistoryDto } from "./messages/get-class-chat-history.api";
import { GetClassChatHistoryQuery } from "./messages/get-class-chat-history.query";
import { SendClassMessageDto } from "./messages/send-class-message.api";
import { SendClassMessageCommand } from "./messages/send-class-message.command";
import { DeleteClassMessageCommand } from "./messages/delete-class-message.command";

@Controller(["classes", "chat/classes"])
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(":classId/chat-history")
  async getChatHistory(
    @Req() req: any,
    @Param("classId") classId: string,
    @Query() query: GetClassChatHistoryDto,
  ) {
    return await this.queryBus.execute(
      new GetClassChatHistoryQuery(req.user.id, classId, query.take || 50),
    );
  }

  @Post(":classId/chat/messages")
  async sendMessage(
    @Req() req: any,
    @Param("classId") classId: string,
    @Body() dto: SendClassMessageDto,
  ) {
    return await this.commandBus.execute(
      new SendClassMessageCommand(req.user.id, classId, dto.content),
    );
  }

  @Delete(":classId/chat/messages/:messageId")
  async deleteMessage(
    @Req() req: any,
    @Param("classId") classId: string,
    @Param("messageId") messageId: string,
  ) {
    return await this.commandBus.execute(
      new DeleteClassMessageCommand(req.user.id, classId, messageId),
    );
  }
}
