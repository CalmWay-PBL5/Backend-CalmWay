export class ChatWithAssistantCommand {
  constructor(
    public readonly message: string,
    public readonly file?: Express.Multer.File,
  ) {}
}
