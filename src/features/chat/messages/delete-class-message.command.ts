export class DeleteClassMessageCommand {
  constructor(
    public readonly actorId: string,
    public readonly classId: string,
    public readonly messageId: string,
  ) {}
}
