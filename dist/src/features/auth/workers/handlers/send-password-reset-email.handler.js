"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SendPasswordResetEmailHandler", {
    enumerable: true,
    get: function() {
        return SendPasswordResetEmailHandler;
    }
});
const _common = require("@nestjs/common");
const _mailbuilderservice = require("../../../../shared/mailer/mail-builder.service");
const _mailtransportservice = require("../../../../shared/mailer/mail-transport.service");
const _appconfigservice = require("../../../../core/config/app-config.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SendPasswordResetEmailHandler = class SendPasswordResetEmailHandler {
    async handle(data) {
        const { email, name, token } = data;
        try {
            const frontendUrl = this.config.get("FRONTEND_URL");
            const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
            const htmlContent = await this.mailBuilder.buildTemplate("reset-password", {
                name: name || "Thành viên",
                resetUrl
            });
            await this.mailTransport.send(email, "Đặt lại mật khẩu Flying Class", htmlContent);
            this.logger.log(`Successfully dispatched password reset email to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}`, error);
            throw error;
        }
    }
    constructor(mailBuilder, mailTransport, config){
        this.mailBuilder = mailBuilder;
        this.mailTransport = mailTransport;
        this.config = config;
        this.logger = new _common.Logger(SendPasswordResetEmailHandler.name);
    }
};
SendPasswordResetEmailHandler = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _mailbuilderservice.MailBuilderService === "undefined" ? Object : _mailbuilderservice.MailBuilderService,
        typeof _mailtransportservice.MailTransportService === "undefined" ? Object : _mailtransportservice.MailTransportService,
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], SendPasswordResetEmailHandler);

//# sourceMappingURL=send-password-reset-email.handler.js.map