import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { FinanceAdminController } from "./finance-admin.controller";
import { ReviewPayoutHandler } from "./payouts/review-payout.handler";
import { RolesGuard } from "../auth/guards/roles.guard";
import { GetRevenueDashboardHandler } from "./dashboard/get-revenue-dashboard.handler";
import { ListFinanceTransactionsHandler } from "./transactions/list-transactions.handler";

@Module({
  imports: [CqrsModule],
  controllers: [FinanceAdminController],
  providers: [
    ReviewPayoutHandler,
    GetRevenueDashboardHandler,
    ListFinanceTransactionsHandler,
    RolesGuard,
  ],
})
export class FinanceModule {}
