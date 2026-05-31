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
  /** Kort «hva handler dette om» — så koden ikke står naken. */
  description: string;
  barriere: string;
  motivasjon: string;
};

const arbeidsgiverItems: MatriseItem[] = lederJourney.phases.map((p) => ({
  id: `Steg ${p.n}`,
  title: p.title,
  description: p.actorGoal,
  barriere: p.barriere.kategori,
  motivasjon: p.motivasjon.driver,
}));

const sykmeldtItems: MatriseItem[] = sykmeldtMapPhases.flatMap((phase) =>
  phase.tiltak.map((tiltak) => ({
    id: tiltak.id,
    title: tiltak.title,
    description: tiltak.onsketAtferd,
    barriere: tiltak.barriere,
    motivasjon: tiltak.motivasjon,
  })),
);

/** Korte forklaringer av barriere-kategoriene (fra atferdskartleggingen) — så
 *  «Manglende rutiner» o.l. ikke er en naken etikett. Utkast, kan justeres. */
export const barriereForklaring: Record<string, string> = {
  "Tidspress og prioritering":
    "Oppgaven konkurrerer med alt annet og havner bakerst — særlig når man har det travelt eller er syk.",
  "Manglende rutiner":
    "Ingen etablert vane eller fast flate utløser handlingen, så den glipper.",
  "Relasjon og tillit":
    "Usikkerhet eller lav tillit i relasjonen gjør at man vegrer seg for å ta initiativ.",
  "Kunnskapsmangel og uklarhet":
    "Man vet ikke hva som forventes, hva man skal gjøre eller hvorfor — terskelen for å begynne blir høy.",
};

/** Korte forklaringer av motivasjonsdriverne (fra atferdskartleggingen). */
export const driverForklaring: Record<string, string> = {
  "Autonomi og eierskap":
    "Å få bestemme selv og eie egen prosess — ikke bare vente på at andre handler.",
  "Identitet og rolle":
    "Å handle i tråd med hvem man er og rollen man har (f.eks. «en god leder følger opp sine»).",
  "Tilhørighet og relasjon":
    "Ønsket om å ivareta relasjonen og være en del av fellesskapet på jobben.",
  "Plikt og ytre forventninger":
    "Å gjøre det som forventes — av regelverk, arbeidsgiver eller samfunn.",
  "Ytre insentiver":
    "Konkrete fordeler eller konsekvenser (frister, økonomi, oppfølging) som trekker handlingen fram.",
};

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
