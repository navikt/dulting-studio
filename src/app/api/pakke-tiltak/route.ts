import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { type NewPakkeTiltak, pakkeTiltak } from "@/db/schema";
import { type ProtectedApiContext, withProtectedApiRoute } from "@/lib/auth";
import { logError, logInfo } from "@/lib/logger";
import { selectionTiltak } from "@/lib/tiltakspakke-utvelgelse-model";

export const dynamic = "force-dynamic";

const KNOWN = new Map(selectionTiltak.map((t) => [t.id, t]));

function seedRow(t: (typeof selectionTiltak)[number]): NewPakkeTiltak {
  return {
    id: t.id,
    aktor: t.aktor,
    title: t.title,
    steg: t.steg,
    innsats: t.innsats,
    effekt: t.effekt,
    tier: t.tier,
    kjerne: t.kjerne ?? false,
    hypotese: t.hypotese ?? [],
    blokkertAv: t.blokkertAv ?? null,
    guardrail: t.guardrail ?? null,
    forgood: t.forgood ?? null,
    toveis: t.toveis ?? null,
    hvorfor: t.hvorfor ?? null,
    updatedBy: "seed",
  };
}

/** Førstegangs-seed fra TS-modellen hvis tabellen er tom (idempotent). */
async function ensureSeeded(db: ReturnType<typeof getDb>) {
  const existing = await db
    .select({ id: pakkeTiltak.id })
    .from(pakkeTiltak)
    .limit(1);
  if (existing.length > 0) return;
  await db
    .insert(pakkeTiltak)
    .values(selectionTiltak.map(seedRow))
    .onConflictDoNothing();
}

export async function handleGet(
  request: Request,
  context: ProtectedApiContext,
) {
  try {
    const db = getDb();
    await ensureSeeded(db);
    const rows = await db.select().from(pakkeTiltak);
    logInfo("Served pakke-tiltak", {
      callId: context.callId,
      path: "/api/pakke-tiltak",
      resultCount: rows.length,
    });
    return Response.json({ tiltak: rows, callId: context.callId });
  } catch (error) {
    logError("Failed to fetch pakke-tiltak", {
      callId: context.callId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return Response.json(
      { message: "Intern serverfeil", callId: context.callId },
      { status: 500 },
    );
  }
}

const TIERS = new Set(["pakke1", "vurder", "senere"]);
const HYP = new Set(["H1", "H2"]);

function clean(v: unknown, max = 2000): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length === 0 ? null : s.slice(0, max);
}

export async function handlePut(
  request: Request,
  context: ProtectedApiContext,
) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json(
      { message: "Ugyldig JSON", callId: context.callId },
      { status: 400 },
    );
  }

  const id = typeof body.id === "string" ? body.id : "";
  const base = KNOWN.get(id);
  if (!base) {
    return Response.json(
      { message: "Ukjent tiltak-id", callId: context.callId },
      { status: 400 },
    );
  }

  const innsats = Number(body.innsats);
  const effekt = Number(body.effekt);
  const tier = String(body.tier);
  if (![1, 2, 3].includes(innsats) || ![1, 2, 3].includes(effekt)) {
    return Response.json(
      { message: "innsats/effekt må være 1–3", callId: context.callId },
      { status: 400 },
    );
  }
  if (!TIERS.has(tier)) {
    return Response.json(
      { message: "ugyldig tier", callId: context.callId },
      { status: 400 },
    );
  }
  const hypotese = Array.isArray(body.hypotese)
    ? body.hypotese.filter(
        (h): h is string => typeof h === "string" && HYP.has(h),
      )
    : (base.hypotese ?? []);
  const title = clean(body.title, 200) ?? base.title;

  // Identitet/struktur (aktor, steg) beholdes fra modellen; resten er redigerbart.
  const row: NewPakkeTiltak = {
    id,
    aktor: base.aktor,
    steg: base.steg,
    title,
    innsats: innsats as 1 | 2 | 3,
    effekt: effekt as 1 | 2 | 3,
    tier,
    kjerne: Boolean(body.kjerne),
    hypotese,
    blokkertAv: clean(body.blokkertAv),
    guardrail: clean(body.guardrail),
    forgood: clean(body.forgood),
    toveis: clean(body.toveis),
    hvorfor: clean(body.hvorfor),
    updatedBy: context.user.navIdent,
  };

  try {
    const db = getDb();
    await db
      .insert(pakkeTiltak)
      .values(row)
      .onConflictDoUpdate({
        target: pakkeTiltak.id,
        set: {
          title: row.title,
          innsats: row.innsats,
          effekt: row.effekt,
          tier: row.tier,
          kjerne: row.kjerne,
          hypotese: row.hypotese,
          blokkertAv: row.blokkertAv,
          guardrail: row.guardrail,
          forgood: row.forgood,
          toveis: row.toveis,
          hvorfor: row.hvorfor,
          updatedBy: row.updatedBy,
          updatedAt: sql`now()`,
          version: sql`${pakkeTiltak.version} + 1`,
        },
      });
    logInfo("Updated pakke-tiltak", {
      callId: context.callId,
      tiltak: id,
      by: context.user.navIdent,
    });
    const [updated] = await db
      .select()
      .from(pakkeTiltak)
      .where(eq(pakkeTiltak.id, id));
    return Response.json({ tiltak: updated, callId: context.callId });
  } catch (error) {
    logError("Failed to update pakke-tiltak", {
      callId: context.callId,
      tiltak: id,
      error: error instanceof Error ? error.message : "unknown",
    });
    return Response.json(
      { message: "Intern serverfeil", callId: context.callId },
      { status: 500 },
    );
  }
}

export const GET = withProtectedApiRoute((request, context) =>
  handleGet(request, context),
);
export const PUT = withProtectedApiRoute((request, context) =>
  handlePut(request, context),
);
