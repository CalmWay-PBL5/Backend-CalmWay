import { CourseStatus } from "@prisma/client";
import { IsIn, IsString, ValidateIf } from "class-validator";

export class ReviewCourseDto {
  @IsIn([CourseStatus.APPROVED, CourseStatus.REJECTED], {
    message: "Trạng thái duyệt chỉ được là APPROVED hoặc REJECTED",
  })
  status: CourseStatus;

  @ValidateIf((o) => o.status === CourseStatus.REJECTED)
  @IsString({ message: "Bắt buộc nhập lý do từ chối" })
  reason?: string;
}
