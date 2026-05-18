import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ChatController } from "./chat.controller";
import { SendClassMessageHandler } from "./messages/send-class-message.handler";
import { GetClassChatHistoryHandler } from "./messages/get-class-chat-history.handler";
import { DeleteClassMessageHandler } from "./messages/delete-class-message.handler";

@Module({
  imports: [CqrsModule],
  controllers: [ChatController],
  providers: [
    SendClassMessageHandler,
    GetClassChatHistoryHandler,
    DeleteClassMessageHandler,
  ],
})
export class ChatModule {}
