export class RemoveMyClassMemberCommand {
  constructor(
    public readonly teacherId: string,
    public readonly classId: string,
    public readonly studentId: string,
  ) {}
}
