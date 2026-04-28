import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

const LESSON_CONTENT_TYPES = ['video', 'document', 'text'] as const;

export class CreateLessonDto {
  @IsUUID()
  classId!: string;

  @IsString()
  title!: string;

  @IsString()
  @IsIn(LESSON_CONTENT_TYPES)
  contentType!: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  bodyText?: string;

  @Type(() => Number)
  @IsInt()
  orderIndex!: number;

  @IsOptional()
  @IsString()
  aiSummaryText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiKeywords?: string[];
}
