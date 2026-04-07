import { IsOptional, IsString } from 'class-validator';

export class GetRevenueFilterDto {
  @IsOptional()
  @IsString()
  teacherId?: string;
}

export class GetMonthlyRevenueDto {
  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;
}