"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReviewCourseCommand", {
    enumerable: true,
    get: function() {
        return ReviewCourseCommand;
    }
});
let ReviewCourseCommand = class ReviewCourseCommand {
    constructor(courseId, adminId, dto){
        this.courseId = courseId;
        this.adminId = adminId;
        this.dto = dto;
    }
};

//# sourceMappingURL=review-course.command.js.map