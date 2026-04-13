import { IsNotEmpty, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateCloudDocDto {
  @IsNotEmpty({ message: "Tiêu đề không được để trống." })
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsNotEmpty({ message: "Link tài liệu không được để trống." })
  @IsUrl({}, { message: "Link tài liệu phải là URL hợp lệ." })
  url!: string;

  @IsNotEmpty({ message: "ID lớp học không được để trống." })
  @IsString()
  classId!: string;
}
