export class GetKycStatsQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
