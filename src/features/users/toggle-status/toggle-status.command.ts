import { ToggleUserStatusDto } from "./toggle-status.api";

export class ToggleUserStatusCommand {
  constructor(
    public readonly targetUserId: string,
    public readonly adminId: string,
    public readonly dto: ToggleUserStatusDto,
  ) {}
}
