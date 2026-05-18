import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateMyClassMemberDto } from "./class-members/create-my-class-member.api";
import { ListMyClassMembersDto } from "./class-members/list-my-class-members.api";
import { AddMyClassMemberCommand } from "./class-members/add-my-class-member.command";
import { ListMyClassMembersQuery } from "./class-members/list-my-class-members.query";
import { RemoveMyClassMemberCommand } from "./class-members/remove-my-class-member.command";

@Controller(["teachers/me/class-members", "class-members"])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LECTURER)
export class TeacherClassMembersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async add(@Req() req: any, @Body() dto: CreateMyClassMemberDto) {
    return await this.commandBus.execute(new AddMyClassMemberCommand(req.user.id, dto));
  }

  @Get("class/:classId")
  async listByClass(
    @Req() req: any,
    @Param("classId") classId: string,
    @Query() query: ListMyClassMembersDto,
  ) {
    return await this.queryBus.execute(
      new ListMyClassMembersQuery(req.user.id, classId, query.status),
    );
  }

  @Delete("class/:classId/student/:studentId")
  async remove(
    @Req() req: any,
    @Param("classId") classId: string,
    @Param("studentId") studentId: string,
  ) {
    return await this.commandBus.execute(
      new RemoveMyClassMemberCommand(req.user.id, classId, studentId),
    );
  }
}
