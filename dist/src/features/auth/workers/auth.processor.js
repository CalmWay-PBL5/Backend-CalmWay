"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthProcessor", {
    enumerable: true,
    get: function() {
        return AuthProcessor;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _common = require("@nestjs/common");
const _sendregisteremailhandler = require("./handlers/send-register-email.handler");
const _sendpasswordresetemailhandler = require("./handlers/send-password-reset-email.handler");
const _sendkycresultemailhandler = require("../../kyc/workers/handlers/send-kyc-result-email.handler");
const _sendcoursereviewhandler = require("../../courses/workers/handlers/send-course-review.handler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AuthProcessor = class AuthProcessor extends _bullmq.WorkerHost {
    async process(job) {
        this.logger.debug(`[Auth Queue] Handling job: ${job.name}`);
        switch(job.name){
            case "send-register-email":
                return await this.registerEmailHandler.handle(job.data);
            case "send-password-reset-email":
                return await this.resetEmailHandler.handle(job.data);
            case "send-kyc-result-email":
                return await this.kycResultEmailHandler.handle(job.data);
            case "send-course-review-result":
                return await this.courseReviewEmailHandler.handle(job.data);
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }
    constructor(registerEmailHandler, resetEmailHandler, kycResultEmailHandler, courseReviewEmailHandler){
        super(), this.registerEmailHandler = registerEmailHandler, this.resetEmailHandler = resetEmailHandler, this.kycResultEmailHandler = kycResultEmailHandler, this.courseReviewEmailHandler = courseReviewEmailHandler, this.logger = new _common.Logger(AuthProcessor.name);
    }
};
AuthProcessor = _ts_decorate([
    (0, _bullmq.Processor)("auth-queue"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _sendregisteremailhandler.SendRegisterEmailHandler === "undefined" ? Object : _sendregisteremailhandler.SendRegisterEmailHandler,
        typeof _sendpasswordresetemailhandler.SendPasswordResetEmailHandler === "undefined" ? Object : _sendpasswordresetemailhandler.SendPasswordResetEmailHandler,
        typeof _sendkycresultemailhandler.SendKycResultEmailHandler === "undefined" ? Object : _sendkycresultemailhandler.SendKycResultEmailHandler,
        typeof _sendcoursereviewhandler.SendCourseReviewEmailHandler === "undefined" ? Object : _sendcoursereviewhandler.SendCourseReviewEmailHandler
    ])
], AuthProcessor);

//# sourceMappingURL=auth.processor.js.map