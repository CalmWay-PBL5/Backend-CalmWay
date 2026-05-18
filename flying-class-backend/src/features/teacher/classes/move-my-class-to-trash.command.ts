export class MoveMyClassToTrashCommand {
  constructor(
    public readonly teacherId: string,
    public readonly classId: string,
  ) {}
}
