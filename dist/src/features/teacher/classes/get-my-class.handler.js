"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetMyClassHandler", {
    enumerable: true,
    get: function() {
        return GetMyClassHandler;
    }
});
const _common = require("@nestjs/common");
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _classmapper = require("./class.mapper");
const _getmyclassquery = require("./get-my-class.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GetMyClassHandler = class GetMyClassHandler {
    async execute(query) {
        const classItem = await this.prisma.class.findFirst({
            where: {
                id: query.classId,
                teacher_id: query.teacherId,
                status: _client.ClassStatus.ACTIVE
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
            throw new _common.NotFoundException("Không tìm thấy lớp học hoặc lớp đã bị xóa.");
        }
        return (0, _classmapper.mapClassEntity)(classItem);
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GetMyClassHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_getmyclassquery.GetMyClassQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GetMyClassHandler);

//# sourceMappingURL=get-my-class.handler.js.map