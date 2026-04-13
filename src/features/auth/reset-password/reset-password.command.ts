import { ResetPasswordDto } from "./reset-password.api";

export class ResetPasswordCommand {
  constructor(public readonly dto: ResetPasswordDto) {}
}
