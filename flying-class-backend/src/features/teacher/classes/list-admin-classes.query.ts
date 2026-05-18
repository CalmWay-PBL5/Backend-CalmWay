import { ClassStatus } from "@prisma/client";

export class ListAdminClassesQuery {
  constructor(
    public readonly keyword: string | undefined,
    public readonly status: ClassStatus | undefined,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
