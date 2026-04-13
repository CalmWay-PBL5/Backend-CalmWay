import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class SendClassMessageDto {
  @IsString()
  @IsNotEmpty({ message: "Nội dung tin nhắn không được để trống." })
  @MaxLength(5000)
  content!: string;
}
