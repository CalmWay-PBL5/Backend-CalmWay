"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RegisterCommand", {
    enumerable: true,
    get: function() {
        return RegisterCommand;
    }
});
let RegisterCommand = class RegisterCommand {
    constructor(email, fullName, plainTextPassword, role){
        this.email = email;
        this.fullName = fullName;
        this.plainTextPassword = plainTextPassword;
        this.role = role;
    }
};

//# sourceMappingURL=register.command.js.map