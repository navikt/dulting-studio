// Kjører én gang ved server-oppstart (Next instrumentation). Vi migrerer
// databasen her — i tråd med ADR-003 «ett kontrollert steg». Lås + migrering +
// unlock kjøres på ÉN dedikert pg.Client (ikke poolen), slik at den session-baserte
// advisory-låsen faktisk holdes på den connectionen migreringen kjører på.
// pg_try_advisory_lock er ikke-blokkerende: taper man kappløpet (kortvarig
// pod-overlapp ved rullende deploy), hopper man elegant ut.
//
// Alt er guardet: kjører bare i node-runtime og bare når en database er
// konfigurert, og svelger feil (logger) — en DB-feil skal ALDRI hindre at appen
// (forsiden, brukerreisene, referansesidene) starter. getDb er dessuten lazy.
const MIGRATION_LOCK_ID = 47110815;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { resolveDbConfig } = await import("./db/client");
  const config = resolveDbConfig();
  if (!config) {
    console.log("[migrate] ingen database konfigurert — hopper over migrering");
    return;
  }

  const { default: pg } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");

  // Én dedikert connection: garanterer at advisory-låsen og migreringen kjører
  // på samme session. Samme config som poolen (diskrete DB_*-deler + ssl-objekt
  // for NAIS) — ikke en connection-string med sslmode, se db/client.ts.
  const client = new pg.Client(config);
  try {
    await client.connect();
    const res = await client.query(
      "select pg_try_advisory_lock($1) as locked",
      [MIGRATION_LOCK_ID],
    );
    if (!res.rows[0]?.locked) {
      console.log("[migrate] en annen instans migrerer — hopper over");
      return;
    }
    try {
      await migrate(drizzle(client), { migrationsFolder: "migrations" });
      console.log("[migrate] migreringer kjørt");
    } finally {
      await client.query("select pg_advisory_unlock($1)", [MIGRATION_LOCK_ID]);
    }
  } catch (error) {
    // Aldri kast — appen skal starte uansett (DB-rutene feiler heller isolert).
    console.error("[migrate] migrering feilet (fortsetter oppstart):", error);
  } finally {
    await client.end().catch(() => {});
  }
}
