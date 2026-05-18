import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ListAssistantModelsQuery } from "./list-models.query";
import { AiAssistantService } from "../ai-assistant.service";

@QueryHandler(ListAssistantModelsQuery)
export class ListAssistantModelsHandler
  implements IQueryHandler<ListAssistantModelsQuery>
{
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  async execute() {
    const models = await this.aiAssistantService.listAvailableModels();

    return {
      models,
    };
  }
}
