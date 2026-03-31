import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; 
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private prismaClient: PrismaClient;

  constructor(configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('database.url');
    const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
    
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    this.prismaClient = new PrismaClient({
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
      // @ts-ignore - Event types with adapter-pg are different
      this.prismaClient.$on('query', (e: any) => {
        this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
      });
    }

    // @ts-ignore - Event types with adapter-pg are different
    this.prismaClient.$on('info', (e: any) => this.logger.log(e.message));
    // @ts-ignore - Event types with adapter-pg are different
    this.prismaClient.$on('warn', (e: any) => this.logger.warn(e.message));
    // @ts-ignore - Event types with adapter-pg are different
    this.prismaClient.$on('error', (e: any) => this.logger.error(e.message));
  }

  // ✅ Expose all Prisma delegates with proper typing
  get user() { return this.prismaClient.user; }
  get profile() { return this.prismaClient.profile; }
  get subject() { return this.prismaClient.subject; }
  get class() { return this.prismaClient.class; }
  get review() { return this.prismaClient.review; }
  get enrollment() { return this.prismaClient.enrollment; }
  get lesson() { return this.prismaClient.lesson; }
  get exam() { return this.prismaClient.exam; }
  get question() { return this.prismaClient.question; }
  get submission() { return this.prismaClient.submission; }
  get schedule() { return this.prismaClient.schedule; }
  get comment() { return this.prismaClient.comment; }
  get transaction() { return this.prismaClient.transaction; }
  get notification() { return this.prismaClient.notification; }
  get aiUsageLog() { return this.prismaClient.aiUsageLog; }
  
  // Expose Prisma utilities
  get $queryRaw() { return this.prismaClient.$queryRaw; }
  get $transaction() { return this.prismaClient.$transaction; }


  async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        // P2024: Connection pool timeout
        // P2034: Transaction conflict/deadlock (usually requiring a retry)
        const isTransient = error.code === 'P2024' || error.code === 'P2034';
        
        if (!isTransient || attempt === maxRetries - 1) break;
        
        const delay = Math.pow(2, attempt) * 100; // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise(res => setTimeout(res, delay));
        this.logger.warn(`Transient error ${error.code}. Retrying attempt ${attempt + 1}/${maxRetries}...`);
      }
    }
    throw lastError;
  }

  async onModuleInit() {
    await this.prismaClient.$connect();
    this.logger.log('✅ Prisma successfully connected to database');
  }

  async onModuleDestroy() {
    await this.prismaClient.$disconnect();
    this.logger.log('✅ Prisma connection gracefully closed');
  }
}
