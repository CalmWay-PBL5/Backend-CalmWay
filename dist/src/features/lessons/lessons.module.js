"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LessonsModule", {
    enumerable: true,
    get: function() {
        return LessonsModule;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _lessonscontroller = require("./lessons.controller");
const _createclouddochandler = require("./cloud-doc/create-cloud-doc.handler");
const _listclouddocshandler = require("./cloud-doc/list-cloud-docs.handler");
const _updateclouddoctitlehandler = require("./cloud-doc/update-cloud-doc-title.handler");
const _deleteclouddochandler = require("./cloud-doc/delete-cloud-doc.handler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let LessonsModule = class LessonsModule {
};
LessonsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _cqrs.CqrsModule
        ],
        controllers: [
            _lessonscontroller.LessonsController
        ],
        providers: [
            _createclouddochandler.CreateCloudDocHandler,
            _listclouddocshandler.ListCloudDocsHandler,
            _updateclouddoctitlehandler.UpdateCloudDocTitleHandler,
            _deleteclouddochandler.DeleteCloudDocHandler
        ]
    })
], LessonsModule);

//# sourceMappingURL=lessons.module.js.map