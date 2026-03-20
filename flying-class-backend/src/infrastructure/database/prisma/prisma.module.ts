import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaHealthIndicator } from './prisma.health';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  providers: [PrismaService, PrismaHealthIndicator],
  exports: [PrismaService, PrismaHealthIndicator],
})
export class PrismaModule {}