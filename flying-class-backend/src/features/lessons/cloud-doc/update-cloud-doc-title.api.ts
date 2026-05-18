import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateCloudDocTitleDto {
  @IsNotEmpty({ message: "Tiêu đề không được để trống." })
  @IsString()
  @MaxLength(255)
  title!: string;
}
