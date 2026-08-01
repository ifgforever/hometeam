import { PrismaClient } from '@prisma/client';

const globalAny = global as any;

export const prisma =
  globalAny.prisma ||
  new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') globalAny.prisma = prisma;
