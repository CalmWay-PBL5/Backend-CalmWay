import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ToggleUserStatusDto {
  @IsBoolean({ message: "Trạng thái hoạt động phải là boolean (true/false)" })
  isActive: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
