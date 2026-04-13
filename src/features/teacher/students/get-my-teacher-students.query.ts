export class GetMyTeacherStudentsQuery {
  constructor(
    public readonly teacherId: string,
    public readonly skip: number,
    public readonly take: number,
  ) {}
}
