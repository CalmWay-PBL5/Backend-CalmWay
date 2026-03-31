import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ClassMemberService } from './class-member.service';
import { ClassMemberController } from './class-member.controller';

@Module({
  imports: [InfrastructureModule],
  controllers: [ClassMemberController],
  providers: [ClassMemberService],
})
export class ClassMemberModule {}
