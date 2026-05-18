import { UpdateMyClassDto } from "./update-my-class.api";

export class UpdateMyClassCommand {
  constructor(
    public readonly teacherId: string,
    public readonly classId: string,
    public readonly dto: UpdateMyClassDto,
    public readonly coverImageFile?: Express.Multer.File,
  ) {}
}
