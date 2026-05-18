import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { ClassType } from "@prisma/client";

export class UpdateMyClassDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: "Giá tiền không được nhỏ hơn 0." })
  @IsOptional()
  price?: number;

  @IsEnum(ClassType, {
    message: "Chế độ lớp học chỉ được là PUBLIC hoặc PRIVATE.",
  })
  @IsOptional()
  type?: ClassType;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: "Sĩ số tối đa phải lớn hơn 0." })
  @Max(5000, { message: "Sĩ số tối đa không hợp lệ." })
  @IsOptional()
  maxStudents?: number;

  @IsString()
  @IsOptional()
  subjectId?: string;
}
