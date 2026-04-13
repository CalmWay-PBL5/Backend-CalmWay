"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ToggleUserStatusCommand", {
    enumerable: true,
    get: function() {
        return ToggleUserStatusCommand;
    }
});
let ToggleUserStatusCommand = class ToggleUserStatusCommand {
    constructor(targetUserId, adminId, dto){
        this.targetUserId = targetUserId;
        this.adminId = adminId;
        this.dto = dto;
    }
};

//# sourceMappingURL=toggle-status.command.js.map