import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ClassMemberService } from './class-member.service';
import { CreateClassMemberDto } from './dto/create-class-member.dto';


@Controller('class-members')
export class ClassMemberController {
  constructor(private readonly classMemberService: ClassMemberService) {}

  @Post()
  create(@Body() createDto: CreateClassMemberDto) {
    return this.classMemberService.addStudent(createDto);
  }

  @Get('class/:classId')
  findByClass(@Param('classId') classId: string) {
    return this.classMemberService.findStudentsByClass(classId);
  }

  @Delete('class/:classId/student/:studentId')
  remove(
    @Param('classId') classId: string, 
    @Param('studentId') studentId: string
  ) {
    return this.classMemberService.removeStudent(classId, studentId);
  }
}