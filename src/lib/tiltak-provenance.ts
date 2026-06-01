import { getDultReference } from "./dult-reference-registry";
import { interventionMapPhases } from "./kidult-reference-model";
import { getSykRaakort } from "./sykmeldt-raakort-registry";
import { sykmeldtMapPhases } from "./sykmeldt-reference-model";
import { selectionTiltak } from "./tiltakspakke-utvelgelse-model";

/** Den opprinnelige råkort-teksten for en kode (AG/DULT: tittel; sykmeldt/SYK:
 *  verbatim), eller undefined hvis koden ikke er i noe register. */
export function raakortText(id: string): string | undefined {
  return getDultReference(id)?.title ?? getSykRaakort(id);
}

/** Et råkort tiltaket er bearbeidet fra. Tittel finnes der et register dekker
 *  koden (i dag: AG-råkort/DULT-NN). Sykmeldt-råkort (SYK-NN) har ikke register
 *  med titler ennå, så da vises bare koden. */
export type RaakortRef = { id: string; title?: string };

export type TiltakProvenance = {
  id: string;
  title: string;
  /** Kort «hva er dette» for tiltaket. */
  description: string;
  /** Opprinnelige råkort-forslag tiltaket er bearbeidet fra. */
  raakort: RaakortRef[];
};

const agMap = new Map(
  interventionMapPhases.flatMap((p) => p.tiltak).map((t) => [t.id, t]),
);
const sykMap = new Map(
  sykmeldtMapPhases.flatMap((p) => p.tiltak).map((t) => [t.id, t]),
);
const selMap = new Map(selectionTiltak.map((t) => [t.id, t]));

function withTitles(ids: string[]): RaakortRef[] {
  return ids.map((id) => ({ id, title: raakortText(id) }));
}

/**
 * Slår opp et bearbeidet tiltak (T/ST) og hvilke råkort det er laget av.
 * Kart-modellene er kilden for råkort-koblingen; støttetiltak uten egen
 * kart-oppføring (T13/T14) faller tilbake til utvelgelses-modellen for tekst.
 */
export function findTiltakProvenance(id: string): TiltakProvenance | null {
  const ag = agMap.get(id);
  if (ag) {
    return {
      id: ag.id,
      title: ag.title,
      description: ag.description,
      raakort: withTitles(ag.raakort ?? []),
    };
  }
  const syk = sykMap.get(id);
  if (syk) {
    return {
      id: syk.id,
      title: syk.title,
      description: syk.onsketAtferd,
      raakort: withTitles(syk.raakort),
    };
  }
  const sel = selMap.get(id);
  if (sel) {
    return {
      id: sel.id,
      title: sel.title,
      description: sel.hvorfor ?? "",
      raakort: [],
    };
  }
  return null;
}
