import { Role } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterRequestDto {
  @IsNotEmpty({ message: "Email là bắt buộc" })
  @IsEmail({}, { message: "Email không hợp lệ" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Họ và tên là bắt buộc" })
  fullName!: string;

  @IsString()
  @MinLength(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
  password!: string;

  @IsIn([Role.STUDENT, Role.LECTURER], {
    message: "role chỉ được là STUDENT hoặc LECTURER",
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  role!: Role;
}

export class RegisterResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  role!: Role;
  message!: string;
}
