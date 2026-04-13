import { Role } from "@prisma/client";

export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly fullName: string,
    public readonly plainTextPassword: string,
    public readonly role: Role,
  ) {}
}
