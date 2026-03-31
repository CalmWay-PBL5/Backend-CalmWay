import { IsString, IsOptional, IsNumber, Min, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export enum ClassType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export class CreateClassDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên lớp học không được để trống' })
  title!: string; // <-- ĐÃ SỬA: Thêm dấu chấm than "!"

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá tiền không được nhỏ hơn 0' })
  price!: number; // <-- ĐÃ SỬA: Thêm dấu chấm than "!"

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsEnum(ClassType, { message: 'Chế độ lớp học chỉ được là PUBLIC hoặc PRIVATE' })
  @IsOptional()
  type?: ClassType;
}