import { ReviewKycDto } from "./review-kyc.api";

export class ReviewKycCommand {
  constructor(
    public readonly applicationId: string,
    public readonly adminId: string,
    public readonly dto: ReviewKycDto,
  ) {}
}
