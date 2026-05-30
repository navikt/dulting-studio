// Kjører én gang ved server-oppstart (Next instrumentation). Vi migrerer
// databasen her — i tråd med ADR-003 «ett kontrollert steg». Appen kjører på én
// replica (nais-prod.yaml replicas 1/1); pg_try_advisory_lock serialiserer
// likevel mot kortvarig pod-overlapp ved rullende deploy, uten å blokkere.
//
// Alt er guardet: kjører bare i node-runtime og bare når en database er
// konfigurert, og svelger feil (logger) — en DB-feil skal ALDRI hindre at appen
// (forsiden, brukerreisene, referansesidene) starter. getDb er dessuten lazy.
const MIGRATION_LOCK_ID = 47110815;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { hasDatabaseConfig, getDb } = await import("./db/client");
  if (!hasDatabaseConfig()) {
    console.log("[migrate] ingen database konfigurert — hopper over migrering");
    return;
  }

  try {
    const { sql } = await import("drizzle-orm");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const db = getDb();

    const lock = await db.execute(
      sql`select pg_try_advisory_lock(${MIGRATION_LOCK_ID}) as locked`,
    );
    if (!lock.rows[0]?.locked) {
      console.log("[migrate] en annen instans migrerer — hopper over");
      return;
    }
    try {
      await migrate(db, { migrationsFolder: "migrations" });
      console.log("[migrate] migreringer kjørt");
    } finally {
      await db.execute(sql`select pg_advisory_unlock(${MIGRATION_LOCK_ID})`);
    }
  } catch (error) {
    // Aldri kast — appen skal starte uansett (DB-rutene feiler heller isolert).
    console.error("[migrate] migrering feilet (fortsetter oppstart):", error);
  }
}
