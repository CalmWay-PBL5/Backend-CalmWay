export class SendClassMessageCommand {
  constructor(
    public readonly actorId: string,
    public readonly classId: string,
    public readonly content: string,
  ) {}
}
