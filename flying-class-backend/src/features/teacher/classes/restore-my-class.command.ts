export class RestoreMyClassCommand {
  constructor(
    public readonly teacherId: string,
    public readonly classId: string,
  ) {}
}
