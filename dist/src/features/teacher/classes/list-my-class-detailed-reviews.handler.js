"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ListMyClassDetailedReviewsHandler", {
    enumerable: true,
    get: function() {
        return ListMyClassDetailedReviewsHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _listmyclassdetailedreviewsquery = require("./list-my-class-detailed-reviews.query");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ListMyClassDetailedReviewsHandler = class ListMyClassDetailedReviewsHandler {
    async execute(query) {
        const reviews = await this.prisma.classReview.findMany({
            where: {
                class: {
                    teacher_id: query.teacherId
                }
            },
            include: {
                class: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                student: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                full_name: true,
                                avatar: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return reviews.map((review)=>({
                id: review.id,
                rating: review.rating,
                content: review.content,
                createdAt: review.created_at,
                class: review.class,
                student: {
                    id: review.student.id,
                    email: review.student.email,
                    fullName: review.student.profile?.full_name || null,
                    avatar: review.student.profile?.avatar || null
                }
            }));
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ListMyClassDetailedReviewsHandler = _ts_decorate([
    (0, _cqrs.QueryHandler)(_listmyclassdetailedreviewsquery.ListMyClassDetailedReviewsQuery),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ListMyClassDetailedReviewsHandler);

//# sourceMappingURL=list-my-class-detailed-reviews.handler.js.map