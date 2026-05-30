import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __dultingStudioDb__: Database | undefined;
}

/**
 * Connection string i prioritert rekkefølge:
 *  1. DATABASE_URL (lokal .env)
 *  2. DB_URL (NAIS Cloud SQL med envVarPrefix: DB gir ferdig URL i nyere NAIS)
 *  3. bygd fra delene DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE
 */
export function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.DB_URL) return process.env.DB_URL;
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } =
    process.env;
  if (DB_HOST && DB_DATABASE && DB_USERNAME) {
    const port = DB_PORT ?? "5432";
    const pass = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : "";
    return `postgresql://${encodeURIComponent(DB_USERNAME)}${pass}@${DB_HOST}:${port}/${DB_DATABASE}`;
  }
  return undefined;
}

/** Om en database er konfigurert (brukes av instrumentation før migrering). */
export function hasDatabaseConfig(): boolean {
  return resolveDatabaseUrl() !== undefined;
}

export function getDb(): Database {
  if (globalThis.__dultingStudioDb__) {
    return globalThis.__dultingStudioDb__;
  }

  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL mangler (og ingen NAIS DB_*-variabler funnet).",
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const db = drizzle(pool, { schema });
  globalThis.__dultingStudioDb__ = db;
  return db;
}
