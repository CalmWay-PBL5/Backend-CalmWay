import { LoginDto } from "./login.api";

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}
