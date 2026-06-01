import { getDultReference } from "./dult-reference-registry";
import { interventionMapPhases } from "./kidult-reference-model";
import { getSykRaakort } from "./sykmeldt-raakort-registry";
import { sykmeldtMapPhases } from "./sykmeldt-reference-model";
import {
  type Aktor,
  bangForBuck,
  type HypoteseId,
  type KrId,
  krFor,
  type Niva,
  selectionTiltak,
  type Tier,
} from "./tiltakspakke-utvelgelse-model";

/** Den opprinnelige råkort-teksten for en kode (AG/DULT: tittel; sykmeldt/SYK:
 *  verbatim), eller undefined hvis koden ikke er i noe register. */
export function raakortText(id: string): string | undefined {
  return getDultReference(id)?.title ?? getSykRaakort(id);
}

/** Et råkort tiltaket er bearbeidet fra, med opprinnelig tekst der den finnes. */
export type RaakortRef = { id: string; tekst?: string };

/**
 * Komplett, kanonisk profil for ÉT tiltak — slått sammen fra alle modellene som
 * holder en fasett av samme tiltak (utvelgelse + kart-modellene), så T01 er T01
 * uansett hvor man klikker. Brukes av det delte TiltakDialog-kortet.
 */
export type TiltakProfil = {
  id: string;
  aktor: Aktor;
  title: string;
  tier: Tier;
  kjerne: boolean;
  /** Hva tiltaket er (fra kart-modellene). */
  beskrivelse?: string;
  /** Hvorfor (ikke) i pakke 1 (fra utvelgelsen). */
  hvorfor?: string;
  effekt: Niva;
  innsats: Niva;
  bang: number;
  kr: KrId[];
  hypotese?: HypoteseId[];
  barriere?: string;
  motivasjon?: string;
  dult?: string;
  maaletegn?: string;
  stoppunkt?: string;
  eastFogg?: string;
  forgood?: string;
  toveis?: string;
  delt?: string;
  blokkertAv?: string;
  raakort: RaakortRef[];
};

const agMap = new Map(
  interventionMapPhases.flatMap((p) => p.tiltak).map((t) => [t.id, t]),
);
const sykMap = new Map(
  sykmeldtMapPhases.flatMap((p) => p.tiltak).map((t) => [t.id, t]),
);
const selMap = new Map(selectionTiltak.map((t) => [t.id, t]));

function raakortRefs(ids: string[]): RaakortRef[] {
  return ids.map((id) => ({ id, tekst: raakortText(id) }));
}

/** Kanonisk profil for et tiltak (T/ST). null hvis koden ikke er et tiltak. */
export function getTiltakProfil(id: string): TiltakProfil | null {
  const base = selMap.get(id);
  if (!base) return null;
  const ag = agMap.get(id);
  const syk = sykMap.get(id);
  const raakort = ag?.raakort ?? syk?.raakort ?? [];
  return {
    id: base.id,
    aktor: base.aktor,
    title: base.title,
    tier: base.tier,
    kjerne: base.kjerne ?? false,
    beskrivelse: ag?.description ?? syk?.onsketAtferd,
    hvorfor: base.hvorfor,
    effekt: base.effekt,
    innsats: base.innsats,
    bang: bangForBuck(base),
    kr: krFor(id),
    hypotese: base.hypotese,
    barriere: ag?.barriere ?? syk?.barriere,
    motivasjon: ag?.motivasjon ?? syk?.motivasjon,
    dult: ag?.dult ?? syk?.dult,
    maaletegn: ag?.signal ?? syk?.maaletegn,
    stoppunkt: base.guardrail ?? ag?.guardrail ?? syk?.guardrail,
    eastFogg: ag?.eastFogg ?? syk?.eastFogg,
    forgood: base.forgood ?? ag?.forgood ?? syk?.forgood,
    toveis: base.toveis,
    delt: ag?.sharedWithSykmeldt ?? syk?.sharedWithAg,
    blokkertAv: base.blokkertAv,
    raakort: raakortRefs(raakort),
  };
}
