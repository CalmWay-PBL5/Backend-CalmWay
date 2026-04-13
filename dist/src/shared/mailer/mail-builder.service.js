"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MailBuilderService", {
    enumerable: true,
    get: function() {
        return MailBuilderService;
    }
});
const _common = require("@nestjs/common");
const _handlebars = /*#__PURE__*/ _interop_require_wildcard(require("handlebars"));
const _promises = /*#__PURE__*/ _interop_require_wildcard(require("node:fs/promises"));
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
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
let MailBuilderService = class MailBuilderService {
    async buildTemplate(templateName, context) {
        try {
            let compiledTemplate = this.templateCache.get(templateName);
            if (!compiledTemplate) {
                this.logger.debug(`Template cache miss. Loading from disk: ${templateName}`);
                compiledTemplate = await this.loadAndCompile(templateName);
                this.templateCache.set(templateName, compiledTemplate);
            }
            return compiledTemplate(context);
        } catch (error) {
            const stack = error instanceof Error ? error.stack : "No stack trace available";
            this.logger.error(`Failed to build template: ${templateName}`, stack);
            throw new _common.InternalServerErrorException("Email template compilation failed.");
        }
    }
    async loadAndCompile(templateName) {
        const templatePaths = [
            _path.join(__dirname, "templates", `${templateName}.hbs`),
            _path.join(process.cwd(), "dist", "src", "shared", "mailer", "templates", `${templateName}.hbs`),
            _path.join(process.cwd(), "src", "shared", "mailer", "templates", `${templateName}.hbs`)
        ];
        for (const templatePath of templatePaths){
            try {
                const templateSource = await _promises.readFile(templatePath, "utf-8");
                return _handlebars.compile(templateSource);
            } catch (error) {
                if (this.isNodeError(error) && error.code === "ENOENT") {
                    continue;
                }
                throw error;
            }
        }
        throw new Error(`Template file not found. Checked paths: ${templatePaths.join(", ")}`);
    }
    isNodeError(error) {
        return error instanceof Error;
    }
    constructor(){
        this.logger = new _common.Logger(MailBuilderService.name);
        this.templateCache = new Map();
    }
};
MailBuilderService = _ts_decorate([
    (0, _common.Injectable)()
], MailBuilderService);

//# sourceMappingURL=mail-builder.service.js.map