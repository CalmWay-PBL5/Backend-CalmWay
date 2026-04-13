import { UpdateSettingDto } from "./update-setting.api";

export class UpdateSettingCommand {
  constructor(
    public readonly key: string,
    public readonly adminId: string,
    public readonly dto: UpdateSettingDto,
  ) {}
}
