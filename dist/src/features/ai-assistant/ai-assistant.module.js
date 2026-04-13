"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AiAssistantModule", {
    enumerable: true,
    get: function() {
        return AiAssistantModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _aiassistantcontroller = require("./ai-assistant.controller");
const _aiassistantservice = require("./ai-assistant.service");
const _chathandler = require("./chat/chat.handler");
const _listmodelshandler = require("./models/list-models.handler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AiAssistantModule = class AiAssistantModule {
};
AiAssistantModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule
        ],
        controllers: [
            _aiassistantcontroller.AiAssistantController
        ],
        providers: [
            _aiassistantservice.AiAssistantService,
            _chathandler.ChatWithAssistantHandler,
            _listmodelshandler.ListAssistantModelsHandler
        ]
    })
], AiAssistantModule);

//# sourceMappingURL=ai-assistant.module.js.map