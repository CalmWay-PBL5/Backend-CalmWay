import { ClassMemberStatus } from "@prisma/client";

export class ListMyClassMembersQuery {
  constructor(
    public readonly teacherId: string,
    public readonly classId: string,
    public readonly status?: ClassMemberStatus,
  ) {}
}
