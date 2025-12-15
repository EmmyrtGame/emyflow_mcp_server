import { PrismaClient } from '@prisma/client';

// Singleton pattern to prevent multiple PrismaClient instances
// Each instance opens its own connection pool, causing resource exhaustion
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Create PrismaClient with limited connection pool
// Default is 10 connections per instance - reduce for shared hosting
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Log slow queries in production for debugging
    log: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] 
      : ['query', 'error', 'warn'],
  });
};

// ALWAYS use global singleton to prevent multiple instances
// This was previously backwards - only saved in dev, not prod
export const prisma = global.__prisma ?? createPrismaClient();

// CRITICAL: Always save to global in ALL environments
global.__prisma = prisma;

// Ensure proper cleanup on process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
