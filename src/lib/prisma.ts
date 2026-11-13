import { PrismaClient } from "@prisma/client";

function isDatabaseConfigured(): boolean {
  const raw = (process.env.DATABASE_URL || "").trim();
  if (!raw) return false;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    if (
      !host ||
      host === "host" ||
      host === "placeholder" ||
      host === "your-host" ||
      host === "example.com" ||
      host === "db.example.com"
    ) {
      return false;
    }
    return u.protocol.startsWith("postgres");
  } catch {
    return false;
  }
}

export const dbConfigured = isDatabaseConfigured();

// Reuse a single PrismaClient across hot reloads in development
// to avoid exhausting the database connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createMockPrisma(): PrismaClient {
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    findUniqueOrThrow: async () => ({}),
    findFirstOrThrow: async () => ({}),
    count: async () => 0,
    aggregate: async () => ({ _sum: {} }),
    groupBy: async () => [],
    create: async (d: { data?: unknown }) => d?.data ?? {},
    createMany: async () => ({ count: 0 }),
    update: async (d: { data?: unknown }) => d?.data ?? {},
    updateMany: async () => ({ count: 0 }),
    upsert: async (d: { create?: unknown }) => d?.create ?? {},
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  const proxy: PrismaClient = new Proxy({} as PrismaClient, {
    get: (_target, prop) => {
      if (prop === "$queryRaw" || prop === "$queryRawUnsafe") return async () => [];
      if (prop === "$executeRaw" || prop === "$executeRawUnsafe") return async () => 0;
      if (prop === "$connect" || prop === "$disconnect") return async () => undefined;
      if (prop === "$transaction") {
        return async (fnOrArr: unknown) =>
          typeof fnOrArr === "function" ? fnOrArr(proxy) : [];
      }
      return noOp;
    },
  });
  return proxy;
}

let prismaClient: PrismaClient;
if (!dbConfigured) {
  prismaClient = createMockPrisma();
} else {
  try {
    prismaClient =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaClient;
    }
  } catch {
    prismaClient = createMockPrisma();
  }
}

export const prisma = prismaClient;
