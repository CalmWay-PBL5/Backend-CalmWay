import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService, 
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return indicator.up();
    } catch (error) {
      return indicator.down({ 
        message: 'Prisma check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}