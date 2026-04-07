import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; 
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('database.url');
    const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
    console.log('🚨🚨🚨 CHUỖI KẾT NỐI THỰC TẾ ĐANG DÙNG LÀ:', connectionString);
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      transactionOptions: {
        maxWait: 5000,
        timeout: 10000,
      },
      log:[
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    if (nodeEnv === 'development') {
      // @ts-ignore
      this.$on('query', (e: any) => {
        this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
      });
    }

    // @ts-ignore
    this.$on('info', (e: any) => this.logger.log(e.message));
    // @ts-ignore
    this.$on('warn', (e: any) => this.logger.warn(e.message));
    // @ts-ignore
    this.$on('error', (e: any) => this.logger.error(e.message));
  }

  async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const isTransient = error.code === 'P2024' || error.code === 'P2034';
        
        if (!isTransient || attempt === maxRetries - 1) break;
        
        const delay = Math.pow(2, attempt) * 100;
        await new Promise(res => setTimeout(res, delay));
        this.logger.warn(`Transient error ${error.code}. Retrying attempt ${attempt + 1}/${maxRetries}...`);
      }
    }
    throw lastError;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma successfully connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✅ Prisma connection gracefully closed');
  }
}