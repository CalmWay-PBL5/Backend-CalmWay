import { UpdateMyTeacherProfileDto } from "./update-my-teacher-profile.api";

export class UpdateMyTeacherProfileCommand {
  constructor(
    public readonly teacherId: string,
    public readonly dto: UpdateMyTeacherProfileDto,
    public readonly avatarFile?: Express.Multer.File,
  ) {}
}
