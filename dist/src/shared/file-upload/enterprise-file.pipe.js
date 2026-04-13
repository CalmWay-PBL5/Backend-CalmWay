"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EnterpriseFilePipe", {
    enumerable: true,
    get: function() {
        return EnterpriseFilePipe;
    }
});
const _common = require("@nestjs/common");
const _filewhitelistconstant = require("./file-whitelist.constant");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let EnterpriseFilePipe = class EnterpriseFilePipe {
    transform(file) {
        if (!file) {
            throw new _common.BadRequestException("Vui lòng tải lên một tệp đính kèm.");
        }
        const rules = _filewhitelistconstant.FILE_UPLOAD_RULES[this.context];
        if (!rules) {
            this.logger.error(`Upload context [${this.context}] chưa được định nghĩa.`);
            throw new _common.BadRequestException("Lỗi cấu hình hệ thống máy chủ.");
        }
        const maxSizeBytes = rules.maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            throw new _common.BadRequestException(`Dung lượng file quá lớn. Tối đa cho phép: ${rules.maxSizeMB}MB. ${rules.description}`);
        }
        const allowedMimes = rules.allowedMimes;
        if (!allowedMimes.includes(file.mimetype)) {
            throw new _common.BadRequestException(`Định dạng file [${file.mimetype}] không được hỗ trợ. ${rules.description}`);
        }
        return file;
    }
    constructor(context){
        this.context = context;
        this.logger = new _common.Logger(EnterpriseFilePipe.name);
    }
};
EnterpriseFilePipe = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _filewhitelistconstant.UploadContext === "undefined" ? Object : _filewhitelistconstant.UploadContext
    ])
], EnterpriseFilePipe);

//# sourceMappingURL=enterprise-file.pipe.js.map