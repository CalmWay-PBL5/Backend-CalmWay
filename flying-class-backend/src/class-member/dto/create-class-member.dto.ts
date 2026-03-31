import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClassMemberDto {
  @IsString()
  @IsNotEmpty({ message: 'ID lớp học không được để trống' })
  classId!: string; // Thêm dấu !

  @IsString()
  @IsNotEmpty({ message: 'ID học sinh không được để trống' })
  studentId!: string; // Thêm dấu !
}