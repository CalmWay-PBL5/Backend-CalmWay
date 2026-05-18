import { PayoutStatus } from "@prisma/client";
import {
  IsIn,
  IsString,
  ValidateIf,
  IsNotEmpty,
} from "class-validator";

export class ReviewPayoutDto {
  @IsIn([PayoutStatus.COMPLETED, PayoutStatus.REJECTED])
  status: PayoutStatus;

  @ValidateIf((o) => o.status === PayoutStatus.COMPLETED)
  @IsString()
  @IsNotEmpty({ message: "Bắt buộc nhập mã giao dịch ngân hàng (TxRef) để đối soát" })
  transactionRef?: string;

  @ValidateIf((o) => o.status === PayoutStatus.REJECTED)
  @IsString()
  @IsNotEmpty({ message: "Bắt buộc nhập lý do từ chối" })
  reason?: string;
}
