import { IsNotEmpty, IsString } from "class-validator";

export class CreateMyClassMemberDto {
  @IsString()
  @IsNotEmpty({ message: "ID lớp học không được để trống." })
  classId!: string;

  @IsString()
  @IsNotEmpty({ message: "ID học sinh không được để trống." })
  studentId!: string;
}
