import { Prisma, PrismaClient } from '@prisma/client';

export type PrismaTransaction = Prisma.TransactionClient | PrismaClient;