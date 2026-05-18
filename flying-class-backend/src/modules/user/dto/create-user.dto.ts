import { Role, UserStatus } from "@prisma/client";
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;

  @IsOptional()
  @IsIn(["STUDENT", "ADMIN", "LECTURER", "TEACHER"])
  role?: Role | "TEACHER";

  @IsOptional()
  @IsIn(["ACTIVE", "BANNED"])
  status?: UserStatus;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  @IsUrl()
  identifyCardUrl?: string;
}
