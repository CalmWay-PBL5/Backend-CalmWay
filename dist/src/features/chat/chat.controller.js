"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ChatController", {
    enumerable: true,
    get: function() {
        return ChatController;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _getclasschathistoryapi = require("./messages/get-class-chat-history.api");
const _getclasschathistoryquery = require("./messages/get-class-chat-history.query");
const _sendclassmessageapi = require("./messages/send-class-message.api");
const _sendclassmessagecommand = require("./messages/send-class-message.command");
const _deleteclassmessagecommand = require("./messages/delete-class-message.command");
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
let ChatController = class ChatController {
    async getChatHistory(req, classId, query) {
        return await this.queryBus.execute(new _getclasschathistoryquery.GetClassChatHistoryQuery(req.user.id, classId, query.take || 50));
    }
    async sendMessage(req, classId, dto) {
        return await this.commandBus.execute(new _sendclassmessagecommand.SendClassMessageCommand(req.user.id, classId, dto.content));
    }
    async deleteMessage(req, classId, messageId) {
        return await this.commandBus.execute(new _deleteclassmessagecommand.DeleteClassMessageCommand(req.user.id, classId, messageId));
    }
    constructor(queryBus, commandBus){
        this.queryBus = queryBus;
        this.commandBus = commandBus;
    }
};
_ts_decorate([
    (0, _common.Get)(":classId/chat-history"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("classId")),
    _ts_param(2, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        typeof _getclasschathistoryapi.GetClassChatHistoryDto === "undefined" ? Object : _getclasschathistoryapi.GetClassChatHistoryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ChatController.prototype, "getChatHistory", null);
_ts_decorate([
    (0, _common.Post)(":classId/chat/messages"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("classId")),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        typeof _sendclassmessageapi.SendClassMessageDto === "undefined" ? Object : _sendclassmessageapi.SendClassMessageDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
_ts_decorate([
    (0, _common.Delete)(":classId/chat/messages/:messageId"),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)("classId")),
    _ts_param(2, (0, _common.Param)("messageId")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ChatController.prototype, "deleteMessage", null);
ChatController = _ts_decorate([
    (0, _common.Controller)([
        "classes",
        "chat/classes"
    ]),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.QueryBus === "undefined" ? Object : _cqrs.QueryBus,
        typeof _cqrs.CommandBus === "undefined" ? Object : _cqrs.CommandBus
    ])
], ChatController);

//# sourceMappingURL=chat.controller.js.map