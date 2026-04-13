"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MailTransportService", {
    enumerable: true,
    get: function() {
        return MailTransportService;
    }
});
const _common = require("@nestjs/common");
const _nodemailer = /*#__PURE__*/ _interop_require_wildcard(require("nodemailer"));
const _appconfigservice = require("../../core/config/app-config.service");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let MailTransportService = class MailTransportService {
    async send(to, subject, html) {
        const fromName = "Flying Class";
        const fromEmail = this.config.get("MAIL_FROM");
        try {
            const info = await this.transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to,
                subject,
                html
            });
            this.logger.log(`📧 Email delivered successfully. Message ID: ${info.messageId}`);
        } catch (error) {
            this.logger.error(`❌ SMTP Transport Error: Failed to send to ${to}`, error instanceof Error ? error.stack : error);
            throw new _common.InternalServerErrorException("Failed to send email via SMTP.");
        }
    }
    constructor(config){
        this.config = config;
        this.logger = new _common.Logger(MailTransportService.name);
        this.transporter = _nodemailer.createTransport({
            host: this.config.get("MAIL_HOST"),
            port: Number(this.config.get("MAIL_PORT")),
            secure: this.config.get("MAIL_SECURE") === "true",
            auth: {
                user: this.config.get("MAIL_USER"),
                pass: this.config.get("MAIL_PASS")
            }
        });
    }
};
MailTransportService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _appconfigservice.AppConfigService === "undefined" ? Object : _appconfigservice.AppConfigService
    ])
], MailTransportService);

//# sourceMappingURL=mail-transport.service.js.map