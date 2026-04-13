"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateMyClassCommand", {
    enumerable: true,
    get: function() {
        return UpdateMyClassCommand;
    }
});
let UpdateMyClassCommand = class UpdateMyClassCommand {
    constructor(teacherId, classId, dto, coverImageFile){
        this.teacherId = teacherId;
        this.classId = classId;
        this.dto = dto;
        this.coverImageFile = coverImageFile;
    }
};

//# sourceMappingURL=update-my-class.command.js.map