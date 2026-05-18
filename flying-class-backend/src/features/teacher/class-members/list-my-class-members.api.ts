import { IsEnum, IsOptional } from "class-validator";
import { ClassMemberStatus } from "@prisma/client";

export class ListMyClassMembersDto {
  @IsEnum(ClassMemberStatus)
  @IsOptional()
  status?: ClassMemberStatus;
}
