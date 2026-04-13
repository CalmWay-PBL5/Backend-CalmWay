import { TransactionStatus } from "@prisma/client";

export class ListFinanceTransactionsQuery {
  constructor(
    public readonly q: string | undefined,
    public readonly status: TransactionStatus | undefined,
    public readonly page: number,
    public readonly limit: number,
    public readonly startDate: Date | undefined,
    public readonly endDate: Date | undefined,
  ) {}
}
