"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SendKycResultEmailHandler", {
    enumerable: true,
    get: function() {
        return SendKycResultEmailHandler;
    }
});
const _common = require("@nestjs/common");
const _mailbuilderservice = require("../../../../shared/mailer/mail-builder.service");
const _mailtransportservice = require("../../../../shared/mailer/mail-transport.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SendKycResultEmailHandler = class SendKycResultEmailHandler {
    async handle(data) {
        const { email, status, reason } = data;
        const subject = status === "APPROVED" ? "🚀 Welcome to the Flying Class Instructor Team!" : "Update regarding your KYC verification";
        const htmlContent = await this.mailBuilder.buildTemplate("kyc-result", {
            status,
            reason,
            isApproved: status === "APPROVED"
        });
        this.logger.log(`📧 Dispatching KYC result email (${status}) to: ${email}`);
        await this.mailTransport.send(email, subject, htmlContent);
    }
    constructor(mailBuilder, mailTransport){
        this.mailBuilder = mailBuilder;
        this.mailTransport = mailTransport;
        this.logger = new _common.Logger(SendKycResultEmailHandler.name);
    }
};
SendKycResultEmailHandler = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _mailbuilderservice.MailBuilderService === "undefined" ? Object : _mailbuilderservice.MailBuilderService,
        typeof _mailtransportservice.MailTransportService === "undefined" ? Object : _mailtransportservice.MailTransportService
    ])
], SendKycResultEmailHandler);

//# sourceMappingURL=send-kyc-result-email.handler.js.map