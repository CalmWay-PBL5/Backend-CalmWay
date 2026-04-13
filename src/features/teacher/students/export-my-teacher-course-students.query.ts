export class ExportMyTeacherCourseStudentsQuery {
  constructor(
    public readonly teacherId: string,
    public readonly courseId: string,
  ) {}
}
