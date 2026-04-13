"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ListMyTrashClassesHandler", {
    enumerable: true,
    get: function() {
        return ListMyTrashClassesHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _classmapper = require("./class.mapper");
const _listmytrashclassesquery = require("./list-my-trash-classes.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ListMyTrashClassesHandler = class ListMyTrashClassesHandler {
    async execute(query) {
        const classes = await this.prisma.class.findMany({
            where: {
                teacher_id: query.teacherId,
                status: _client.ClassStatus.PENDING_DELETE
            },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                transactions: {
                    select: {
                        user_id: true,
                        amount: true,
                        status: true
                    }
                },
                classMembers: {
                    select: {
                        student_id: true,
                        status: true,
                        joined_at: true
                    }
                }
            },
            orderBy: {
                deleted_at: "desc"
            }
        });
        return classes.map((classItem)=>(0, _classmapper.mapClassEntity)(classItem));
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ListMyTrashClassesHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_listmytrashclassesquery.ListMyTrashClassesQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ListMyTrashClassesHandler);

//# sourceMappingURL=list-my-trash-classes.handler.js.map