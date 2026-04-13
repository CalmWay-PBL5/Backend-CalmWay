"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ListAssistantModelsHandler", {
    enumerable: true,
    get: function() {
        return ListAssistantModelsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _listmodelsquery = require("./list-models.query");
const _aiassistantservice = require("../ai-assistant.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ListAssistantModelsHandler = class ListAssistantModelsHandler {
    async execute() {
        const models = await this.aiAssistantService.listAvailableModels();
        return {
            models
        };
    }
    constructor(aiAssistantService){
        this.aiAssistantService = aiAssistantService;
    }
};
ListAssistantModelsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_listmodelsquery.ListAssistantModelsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _aiassistantservice.AiAssistantService === "undefined" ? Object : _aiassistantservice.AiAssistantService
    ])
], ListAssistantModelsHandler);

//# sourceMappingURL=list-models.handler.js.map