import { readFileSync } from "node:fs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __dultingStudioDb__: Database | undefined;
}

/**
 * pg-tilkoblingsconfig i prioritert rekkefølge:
 *  1. DATABASE_URL (lokal .env) → connectionString uten SSL
 *  2. NAIS Cloud SQL: diskrete DB_*-deler + eksplisitt ssl-objekt
 *
 * Vi bygger BEVISST ikke en connection-string med sslmode for NAIS. Nyere `pg`
 * (>= 8.16) tolker sslmode=require/verify-ca som verify-full og krever da at
 * hostnavnet matcher serversertifikatet. Cloud SQL-sertifikatet har instans-
 * navnet (*.sql.goog), ikke hosten vi faktisk kobler til, så hostname-sjekken
 * kan aldri passere (ERR_TLS_CERT_ALTNAME_INVALID). Et eksplisitt ssl-objekt
 * med rejectUnauthorized:false slår av den sjekken, men beholder klient- og
 * CA-sertifikatene (mTLS). En sslmode i selve URL-en ville dessuten overstyrt
 * ssl-objektet — derfor diskrete deler. Samme mønster som navikt/kiss og
 * navikt/nda (Node + pg på NAIS Cloud SQL).
 */
export function resolveDbConfig(): PoolConfig | undefined {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  const { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } =
    process.env;
  if (DB_HOST && DB_DATABASE && DB_USERNAME) {
    const ssl: {
      rejectUnauthorized: boolean;
      ca?: string;
      cert?: string;
      key?: string;
    } = { rejectUnauthorized: false };
    if (process.env.DB_SSLROOTCERT)
      ssl.ca = readFileSync(process.env.DB_SSLROOTCERT, "utf-8");
    if (process.env.DB_SSLCERT)
      ssl.cert = readFileSync(process.env.DB_SSLCERT, "utf-8");
    if (process.env.DB_SSLKEY)
      ssl.key = readFileSync(process.env.DB_SSLKEY, "utf-8");

    return {
      host: DB_HOST,
      port: DB_PORT ? Number.parseInt(DB_PORT, 10) : 5432,
      database: DB_DATABASE,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      ssl,
    };
  }

  return undefined;
}

/** Om en database er konfigurert (brukes av instrumentation før migrering). */
export function hasDatabaseConfig(): boolean {
  if (process.env.DATABASE_URL) return true;
  const { DB_HOST, DB_DATABASE, DB_USERNAME } = process.env;
  return Boolean(DB_HOST && DB_DATABASE && DB_USERNAME);
}

export function getDb(): Database {
  if (globalThis.__dultingStudioDb__) {
    return globalThis.__dultingStudioDb__;
  }

  const config = resolveDbConfig();

  if (!config) {
    throw new Error(
      "DATABASE_URL mangler (og ingen NAIS DB_*-variabler funnet).",
    );
  }

  const pool = new Pool({
    ...config,
    // db-f1-micro har lavt max_connections — hold poolen liten. La henging
    // feile raskt i stedet for å blokkere readiness-proben.
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  // pg emitter 'error' på idle-klienter (f.eks. når Cloud SQL dropper en
  // tilkobling). Uten handler blir det en uncaught exception som kan ta ned
  // hele prosessen — selv om all spørringskode er try/catch'et.
  pool.on("error", (err) => {
    console.error("[db] uventet feil på idle-klient:", err);
  });

  const db = drizzle(pool, { schema });
  globalThis.__dultingStudioDb__ = db;
  return db;
}
