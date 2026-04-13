"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReviewCourseHandler", {
    enumerable: true,
    get: function() {
        return ReviewCourseHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _prismaservice = require("../../../infrastructure/database/prisma.service");
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _reviewcoursecommand = require("./review-course.command");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let ReviewCourseHandler = class ReviewCourseHandler {
    async execute(command) {
        const { courseId, adminId, dto } = command;
        const course = await this.prisma.course.findUnique({
            where: {
                id: courseId
            },
            include: {
                instructor: {
                    select: {
                        email: true,
                        id: true
                    }
                }
            }
        });
        if (!course) {
            throw new _common.NotFoundException("Không tìm thấy khóa học.");
        }
        if (course.status !== _client.CourseStatus.PENDING_REVIEW) {
            throw new _common.BadRequestException(`Không thể duyệt. Khóa học hiện đang ở trạng thái: ${course.status}`);
        }
        try {
            await this.prisma.course.update({
                where: {
                    id: courseId
                },
                data: {
                    status: dto.status,
                    rejectionReason: dto.status === _client.CourseStatus.REJECTED ? dto.reason : null,
                    reviewedBy: adminId,
                    reviewedAt: new Date()
                }
            });
            this.mailQueue.add("send-course-review-result", {
                email: course.instructor.email,
                courseTitle: course.title,
                status: dto.status,
                reason: dto.reason
            });
            this.logger.log(`Admin [${adminId}] đã ${dto.status} khóa học [${courseId}]`);
            return {
                message: `Đã ${dto.status === "APPROVED" ? "duyệt" : "từ chối"} khóa học thành công.`
            };
        } catch (error) {
            this.logger.error(`Lỗi khi duyệt khóa học ${courseId}`, error);
            throw new _common.BadRequestException("Quá trình kiểm duyệt thất bại, vui lòng thử lại.");
        }
    }
    constructor(prisma, mailQueue){
        this.prisma = prisma;
        this.mailQueue = mailQueue;
        this.logger = new _common.Logger(ReviewCourseHandler.name);
    }
};
ReviewCourseHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_reviewcoursecommand.ReviewCourseCommand),
    _ts_param(1, (0, _bullmq.InjectQueue)("auth-queue")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _bullmq1.Queue === "undefined" ? Object : _bullmq1.Queue
    ])
], ReviewCourseHandler);

//# sourceMappingURL=review-course.handler.js.map