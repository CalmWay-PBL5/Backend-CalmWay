"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SendCourseReviewEmailHandler", {
    enumerable: true,
    get: function() {
        return SendCourseReviewEmailHandler;
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
let SendCourseReviewEmailHandler = class SendCourseReviewEmailHandler {
    async handle(data) {
        const subject = data.status === "APPROVED" ? `🎉 Khóa học "${data.courseTitle}" đã được duyệt!` : `⚠️ Khóa học "${data.courseTitle}" cần chỉnh sửa`;
        const htmlContent = await this.mailBuilder.buildTemplate("course-review", {
            ...data,
            isApproved: data.status === "APPROVED"
        });
        await this.mailTransport.send(data.email, subject, htmlContent);
        this.logger.log(`Đã gửi email kết quả duyệt khóa học cho: ${data.email}`);
    }
    constructor(mailBuilder, mailTransport){
        this.mailBuilder = mailBuilder;
        this.mailTransport = mailTransport;
        this.logger = new _common.Logger(SendCourseReviewEmailHandler.name);
    }
};
SendCourseReviewEmailHandler = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _mailbuilderservice.MailBuilderService === "undefined" ? Object : _mailbuilderservice.MailBuilderService,
        typeof _mailtransportservice.MailTransportService === "undefined" ? Object : _mailtransportservice.MailTransportService
    ])
], SendCourseReviewEmailHandler);

//# sourceMappingURL=send-course-review.handler.js.map