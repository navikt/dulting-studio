import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __dultingStudioDb__: Database | undefined;
}

export function getDb(): Database {
  if (globalThis.__dultingStudioDb__) {
    return globalThis.__dultingStudioDb__;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL mangler. Sett DATABASE_URL før import-API-et brukes.",
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const db = drizzle(pool, { schema });
  globalThis.__dultingStudioDb__ = db;
  return db;
}
