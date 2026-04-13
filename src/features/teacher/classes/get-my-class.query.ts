export class GetMyClassQuery {
  constructor(
    public readonly teacherId: string,
    public readonly classId: string,
  ) {}
}
