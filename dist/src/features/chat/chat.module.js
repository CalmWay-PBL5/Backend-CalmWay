"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ChatModule", {
    enumerable: true,
    get: function() {
        return ChatModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _chatcontroller = require("./chat.controller");
const _sendclassmessagehandler = require("./messages/send-class-message.handler");
const _getclasschathistoryhandler = require("./messages/get-class-chat-history.handler");
const _deleteclassmessagehandler = require("./messages/delete-class-message.handler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ChatModule = class ChatModule {
};
ChatModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule
        ],
        controllers: [
            _chatcontroller.ChatController
        ],
        providers: [
            _sendclassmessagehandler.SendClassMessageHandler,
            _getclasschathistoryhandler.GetClassChatHistoryHandler,
            _deleteclassmessagehandler.DeleteClassMessageHandler
        ]
    })
], ChatModule);

//# sourceMappingURL=chat.module.js.map