import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { AiAssistantController } from "./ai-assistant.controller";
import { AiAssistantService } from "./ai-assistant.service";
import { ChatWithAssistantHandler } from "./chat/chat.handler";
import { ListAssistantModelsHandler } from "./models/list-models.handler";

@Module({
  imports: [CqrsModule],
  controllers: [AiAssistantController],
  providers: [
    AiAssistantService,
    ChatWithAssistantHandler,
    ListAssistantModelsHandler,
  ],
})
export class AiAssistantModule {}
