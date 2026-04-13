import { CreateMyClassMemberDto } from "./create-my-class-member.api";

export class AddMyClassMemberCommand {
  constructor(
    public readonly teacherId: string,
    public readonly dto: CreateMyClassMemberDto,
  ) {}
}
