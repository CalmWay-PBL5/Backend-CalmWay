"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateMyClassCommand", {
    enumerable: true,
    get: function() {
        return CreateMyClassCommand;
    }
});
let CreateMyClassCommand = class CreateMyClassCommand {
    constructor(teacherId, dto, coverImageFile){
        this.teacherId = teacherId;
        this.dto = dto;
        this.coverImageFile = coverImageFile;
    }
};

//# sourceMappingURL=create-my-class.command.js.map