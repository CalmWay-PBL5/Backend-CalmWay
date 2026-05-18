import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

const CLASS_TYPES = ['public', 'private'] as const;
const CLASS_STATUSES = ['active', 'paused', 'pending_delete', 'deleted'] as const;

type ClassTypeValue = (typeof CLASS_TYPES)[number];
type ClassStatusValue = (typeof CLASS_STATUSES)[number];

export class CreateClassDto {
  @IsUUID()
  subjectId!: string;

  @IsString()
  title!: string;

  @IsString()
  classCode!: string;

  @IsIn(CLASS_TYPES)
  type!: ClassTypeValue;

  @IsOptional()
  @IsIn(CLASS_STATUSES)
  status?: ClassStatusValue;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  price?: number;
}
