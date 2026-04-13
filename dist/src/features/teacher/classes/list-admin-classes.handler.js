"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ListAdminClassesHandler", {
    enumerable: true,
    get: function() {
        return ListAdminClassesHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _client = require("@prisma/client");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _classmapper = require("./class.mapper");
const _listadminclassesquery = require("./list-admin-classes.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ListAdminClassesHandler = class ListAdminClassesHandler {
    async execute(query) {
        if (query.status === _client.ClassStatus.PENDING_DELETE) {
            return {
                items: [],
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total: 0,
                    totalPages: 0
                }
            };
        }
        const keyword = query.keyword?.trim();
        const where = {
            status: query.status ?? {
                not: _client.ClassStatus.PENDING_DELETE
            },
            ...keyword ? {
                OR: [
                    {
                        id: {
                            contains: keyword,
                            mode: "insensitive"
                        }
                    },
                    {
                        title: {
                            contains: keyword,
                            mode: "insensitive"
                        }
                    },
                    {
                        class_code: {
                            contains: keyword,
                            mode: "insensitive"
                        }
                    }
                ]
            } : {}
        };
        const skip = (query.page - 1) * query.limit;
        const [items, total] = await Promise.all([
            this.prisma.class.findMany({
                where,
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
                    created_at: "desc"
                },
                skip,
                take: query.limit
            }),
            this.prisma.class.count({
                where
            })
        ]);
        return {
            items: items.map((classItem)=>(0, _classmapper.mapClassEntity)(classItem)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit)
            }
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ListAdminClassesHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_listadminclassesquery.ListAdminClassesQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ListAdminClassesHandler);

//# sourceMappingURL=list-admin-classes.handler.js.map