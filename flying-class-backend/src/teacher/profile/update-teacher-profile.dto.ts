import { IsString, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTeacherProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  identifyCardUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  degreeUrls?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Số năm kinh nghiệm không được âm' })
  experienceYears?: number;
}