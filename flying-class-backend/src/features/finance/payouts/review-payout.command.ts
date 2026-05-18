import { ReviewPayoutDto } from "./review-payout.api";

export class ReviewPayoutCommand {
  constructor(
    public readonly payoutId: string,
    public readonly adminId: string,
    public readonly dto: ReviewPayoutDto,
  ) {}
}
