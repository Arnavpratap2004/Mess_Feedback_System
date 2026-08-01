import { PrismaClient } from '../generated/prisma/client.ts';

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env for local development, ' +
      'or add it under Project Settings -> Environment Variables on Vercel.'
  );
}

const DATABASE_URL: string = url;

// A Prisma Postgres key ("prisma+postgres://...") talks to the database over
// HTTP, so it needs no connection pool and works well on serverless. A plain
// "postgresql://..." URL goes through the node-postgres driver adapter instead.
const isPrismaPostgres =
  DATABASE_URL.startsWith('prisma+postgres://') || DATABASE_URL.startsWith('prisma://');

async function createClient(): Promise<PrismaClient> {
  if (isPrismaPostgres) {
    return new PrismaClient({ accelerateUrl: DATABASE_URL });
  }

  const { PrismaPg } = await import('@prisma/adapter-pg');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
}

// Next.js recreates modules on every hot reload in dev; cache the client on
// globalThis so we don't leak connections.
const globalForPrisma = globalThis as unknown as { prismaPromise?: Promise<PrismaClient> };

const prismaPromise = globalForPrisma.prismaPromise ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaPromise = prismaPromise;
}

export function getPrisma(): Promise<PrismaClient> {
  return prismaPromise;
}
