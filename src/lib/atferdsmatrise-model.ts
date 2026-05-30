// Atferdsmatrise — «hvorfor»-fundamentet visualisert: motivasjon (5 drivere) ×
// barriere (4 kategorier) fra Nudgelab-atferdskartleggingen. Plotter de
// bearbeidede tiltakene/stegene etter hvilken barriere de løser og hvilken
// driver de spiller på. Bygd fra eksisterende, typed datagrunnlag:
//   - arbeidsgiver: lederJourney.phases (6 steg, hver med barriere + motivasjon)
//   - sykmeldt:     sykmeldtMapPhases → ST01..ST12 (12 tiltak)
import { lederJourney } from "@/components/brukerreise/journey-data";
import { sykmeldtMapPhases } from "@/lib/sykmeldt-reference-model";

export type Aktor = "arbeidsgiver" | "sykmeldt";

/** De 4 barriere-kategoriene (rader). */
export const BARRIERER = [
  "Tidspress og prioritering",
  "Manglende rutiner",
  "Relasjon og tillit",
  "Kunnskapsmangel og uklarhet",
] as const;

/** De 5 motivasjonsdriverne (kolonner). */
export const DRIVERE = [
  "Autonomi og eierskap",
  "Identitet og rolle",
  "Tilhørighet og relasjon",
  "Plikt og ytre forventninger",
  "Ytre insentiver",
] as const;

export type MatriseItem = {
  /** Kort kode/etikett (Steg 01 / ST04). */
  id: string;
  title: string;
  barriere: string;
  motivasjon: string;
};

const arbeidsgiverItems: MatriseItem[] = lederJourney.phases.map((p) => ({
  id: `Steg ${p.n}`,
  title: p.title,
  barriere: p.barriere.kategori,
  motivasjon: p.motivasjon.driver,
}));

const sykmeldtItems: MatriseItem[] = sykmeldtMapPhases.flatMap((phase) =>
  phase.tiltak.map((tiltak) => ({
    id: tiltak.id,
    title: tiltak.title,
    barriere: tiltak.barriere,
    motivasjon: tiltak.motivasjon,
  })),
);

export const matriseItems: Record<Aktor, MatriseItem[]> = {
  arbeidsgiver: arbeidsgiverItems,
  sykmeldt: sykmeldtItems,
};

export const aktorLabel: Record<Aktor, string> = {
  arbeidsgiver: "Arbeidsgiver (nærmeste leder)",
  sykmeldt: "Den sykmeldte",
};

/** Items i en gitt celle (barriere × driver). */
export function itemsInCell(
  aktor: Aktor,
  barriere: string,
  driver: string,
): MatriseItem[] {
  return matriseItems[aktor].filter(
    (it) => it.barriere === barriere && it.motivasjon === driver,
  );
}
