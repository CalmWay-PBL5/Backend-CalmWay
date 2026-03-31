import { PartialType } from '@nestjs/mapped-types';
import { CreateClassMemberDto } from './create-class-member.dto';

export class UpdateClassMemberDto extends PartialType(CreateClassMemberDto) {}
