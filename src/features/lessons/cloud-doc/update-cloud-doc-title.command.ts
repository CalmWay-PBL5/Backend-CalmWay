export class UpdateCloudDocTitleCommand {
  constructor(
    public readonly actorId: string,
    public readonly lessonId: string,
    public readonly title: string,
  ) {}
}
