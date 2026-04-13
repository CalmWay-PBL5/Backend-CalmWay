"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetAdminClassDetailHandler", {
    enumerable: true,
    get: function() {
        return GetAdminClassDetailHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _classmapper = require("./class.mapper");
const _getadminclassdetailquery = require("./get-admin-class-detail.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetAdminClassDetailHandler = class GetAdminClassDetailHandler {
    async execute(query) {
        const classItem = await this.prisma.class.findUnique({
            where: {
                id: query.classId
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
            }
        });
        if (!classItem) {
            throw new _common.NotFoundException("Không tìm thấy lớp học.");
        }
        return (0, _classmapper.mapClassEntity)(classItem);
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetAdminClassDetailHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getadminclassdetailquery.GetAdminClassDetailQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetAdminClassDetailHandler);

//# sourceMappingURL=get-admin-class-detail.handler.js.map