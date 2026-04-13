import { CreateMyClassDto } from "./create-my-class.api";

export class CreateMyClassCommand {
  constructor(
    public readonly teacherId: string,
    public readonly dto: CreateMyClassDto,
    public readonly coverImageFile?: Express.Multer.File,
  ) {}
}
