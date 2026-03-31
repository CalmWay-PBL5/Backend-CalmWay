import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @IsString()
  @IsOptional()
  status?: string; // ACTIVE / PENDING_DELETE

  @IsDateString()
  @IsOptional()
  deletedAt?: Date;
}