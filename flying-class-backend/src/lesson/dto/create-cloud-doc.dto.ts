import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateCloudDocDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title!: string;

  @IsNotEmpty({ message: 'Link tài liệu không được để trống' })
  @IsUrl({}, { message: 'Link tài liệu phải là một URL hợp lệ' })
  url!: string;

  @IsNotEmpty()
  @IsString()
  classId!: string;
}