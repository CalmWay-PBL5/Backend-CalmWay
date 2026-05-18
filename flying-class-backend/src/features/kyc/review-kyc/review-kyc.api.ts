import { KycStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";

export class ReviewKycDto {
  @IsEnum(KycStatus)
  status: KycStatus;

  @ValidateIf((o) => o.status === KycStatus.REJECTED)
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
