export class SearchMyTeacherStudentsQuery {
  constructor(
    public readonly teacherId: string,
    public readonly keyword: string,
    public readonly skip: number,
    public readonly take: number,
  ) {}
}
