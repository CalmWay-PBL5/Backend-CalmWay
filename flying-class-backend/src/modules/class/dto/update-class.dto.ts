import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

const CLASS_TYPES = ['public', 'private'] as const;
const CLASS_STATUSES = ['active', 'pending_delete', 'deleted'] as const;

type ClassTypeValue = (typeof CLASS_TYPES)[number];
type ClassStatusValue = (typeof CLASS_STATUSES)[number];

export class UpdateClassDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  classCode?: string;

  @IsOptional()
  @IsIn(CLASS_TYPES)
  type?: ClassTypeValue;

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

  @IsOptional()
  @IsString()
  invitationToken?: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string;
}
