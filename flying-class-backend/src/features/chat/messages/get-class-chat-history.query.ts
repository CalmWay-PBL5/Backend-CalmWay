export class GetClassChatHistoryQuery {
  constructor(
    public readonly actorId: string,
    public readonly classId: string,
    public readonly take: number,
  ) {}
}
