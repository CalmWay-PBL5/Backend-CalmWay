"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ListMySubjectsHandler", {
    enumerable: true,
    get: function() {
        return ListMySubjectsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _listmysubjectsquery = require("./list-my-subjects.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ListMySubjectsHandler = class ListMySubjectsHandler {
    async execute() {
        return await this.prisma.subject.findMany({
            select: {
                id: true,
                name: true,
                description: true
            },
            orderBy: {
                name: "asc"
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ListMySubjectsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_listmysubjectsquery.ListMySubjectsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ListMySubjectsHandler);

//# sourceMappingURL=list-my-subjects.handler.js.map