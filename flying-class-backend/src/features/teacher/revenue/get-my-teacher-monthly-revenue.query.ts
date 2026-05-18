export class GetMyTeacherMonthlyRevenueQuery {
  constructor(
    public readonly teacherId: string,
    public readonly year: number,
  ) {}
}
