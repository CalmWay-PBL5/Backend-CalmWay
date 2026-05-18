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

const LESSON_CONTENT_TYPES = ['video', 'document', 'text', 'cloud_doc'] as const;

export class UpdateLessonDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn(LESSON_CONTENT_TYPES)
  contentType?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  bodyText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsString()
  aiSummaryText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiKeywords?: string[];
}
