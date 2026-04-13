export class GetRevenueDashboardQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {}
}
