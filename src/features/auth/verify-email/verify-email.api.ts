import { IsString, IsNotEmpty } from "class-validator";

export class VerifyEmailQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
