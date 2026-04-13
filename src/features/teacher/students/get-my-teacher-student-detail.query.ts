export class GetMyTeacherStudentDetailQuery {
  constructor(
    public readonly teacherId: string,
    public readonly studentId: string,
  ) {}
}
