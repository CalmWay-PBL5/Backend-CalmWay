"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KycModule", {
    enumerable: true,
    get: function() {
        return KycModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _bullmq = require("@nestjs/bullmq");
const _mailermodule = require("../../shared/mailer/mailer.module");
const _kyccontroller = require("./kyc.controller");
const _kycadmincontroller = require("./kyc-admin.controller");
const _submitkychandler = require("./submit/submit-kyc.handler");
const _reviewkychandler = require("./review-kyc/review-kyc.handler");
const _getkyclisthandler = require("./queries/get-kyc-list.handler");
const _getkycstatshandler = require("./queries/get-kyc-stats.handler");
const _getmykychandler = require("./queries/get-my-kyc.handler");
const _s3storageservice = require("../../infrastructure/storage/s3-storage.service");
const _sendkycresultemailhandler = require("./workers/handlers/send-kyc-result-email.handler");
const _rolesguard = require("../auth/guards/roles.guard");
const _appconfigservice = require("../../core/config/app-config.service");
const _redisconnectionutil = require("../../infrastructure/redis/redis-connection.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let KycModule = class KycModule {
};
KycModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule,
            _mailermodule.MailerModule,
            _bullmq.BullModule.registerQueueAsync({
                name: "auth-queue",
                inject: [
                    _appconfigservice.AppConfigService
                ],
                useFactory: (config)=>{
                    return {
                        connection: (0, _redisconnectionutil.parseRedisConnection)(config.get("REDIS_URL"), config.get("REDIS_PASSWORD"))
                    };
                }
            })
        ],
        controllers: [
            _kyccontroller.KycController,
            _kycadmincontroller.KycAdminController
        ],
        providers: [
            _submitkychandler.SubmitKycHandler,
            _reviewkychandler.ReviewKycHandler,
            _getkyclisthandler.GetKycListHandler,
            _getkycstatshandler.GetKycStatsHandler,
            _getmykychandler.GetMyKycHandler,
            _sendkycresultemailhandler.SendKycResultEmailHandler,
            _s3storageservice.S3StorageService,
            _rolesguard.RolesGuard
        ],
        exports: [
            _sendkycresultemailhandler.SendKycResultEmailHandler
        ]
    })
], KycModule);

//# sourceMappingURL=kyc.module.js.map