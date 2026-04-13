import { ReviewCourseDto } from "./review-course.api";

export class ReviewCourseCommand {
  constructor(
    public readonly courseId: string,
    public readonly adminId: string,
    public readonly dto: ReviewCourseDto,
  ) {}
}
