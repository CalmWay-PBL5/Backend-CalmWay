"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get Environment () {
        return Environment;
    },
    get EnvironmentVariables () {
        return EnvironmentVariables;
    },
    get validate () {
        return validate;
    }
});
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
var Environment = /*#__PURE__*/ function(Environment) {
    Environment["Development"] = "development";
    Environment["Production"] = "production";
    Environment["Test"] = "test";
    return Environment;
}({});
let EnvironmentVariables = class EnvironmentVariables {
    constructor(){
        this.PORT = 3000;
        this.NODE_ENV = "development";
    }
};
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], EnvironmentVariables.prototype, "PORT", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(Environment),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "POSTGRES_USER", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "POSTGRES_PASSWORD", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "POSTGRES_DB", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "DATABASE_URL", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_URL", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_PASSWORD", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "S3_ACCESS_KEY", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "S3_SECRET_KEY", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "S3_BUCKET_NAME", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "S3_ENDPOINT", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "S3_REGION", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "S3_PUBLIC_ENDPOINT", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "FRONTEND_URL", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "MAIL_HOST", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", Number)
], EnvironmentVariables.prototype, "MAIL_PORT", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsIn)([
        "true",
        "false"
    ]),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "MAIL_SECURE", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "MAIL_USER", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "MAIL_PASS", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "MAIL_FROM", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_SECRET", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_EXPIRES_IN", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_SECRET", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_EXPIRES_IN", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], EnvironmentVariables.prototype, "GEMINI_API_KEY", void 0);
function validate(config) {
    const validatedConfig = (0, _classtransformer.plainToInstance)(EnvironmentVariables, config, {
        enableImplicitConversion: true
    });
    const errors = (0, _classvalidator.validateSync)(validatedConfig, {
        skipMissingProperties: false
    });
    if (errors.length > 0) {
        throw new Error(`❌ Invalid Environment Configuration: \n${errors.toString()}`);
    }
    return validatedConfig;
}

//# sourceMappingURL=env.validation.js.map