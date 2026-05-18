import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ChatWithAssistantCommand } from "./chat.command";
import { AiAssistantService } from "../ai-assistant.service";

@CommandHandler(ChatWithAssistantCommand)
export class ChatWithAssistantHandler
  implements ICommandHandler<ChatWithAssistantCommand>
{
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  async execute(command: ChatWithAssistantCommand) {
    const reply = await this.aiAssistantService.generateChatResponse(
      command.message,
      command.file,
    );

    return {
      reply,
    };
  }
}
