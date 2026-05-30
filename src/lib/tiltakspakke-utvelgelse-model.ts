// Utvelgelses-modell for FØRSTE tiltakspakke: legger de bearbeidede tiltakene
// (arbeidsgiver T01–T14 fra kidult-reference-model, sykmeldt ST01–ST12 fra
// sykmeldt-reference-model) på beslutnings-aksene effekt × innsats, med blokkert-
// flagg, FORGOOD-merknad og toveis-kobling — pluss et forslag til pakke 1.
//
// VIKTIG: effekt/innsats-anslagene er et UTKAST utledet fra register- og scoping-
// docs (dulting-tiltaksregister*.md, dulting-scoping-status.md). De er et
// utgangspunkt teamet kalibrerer, ikke en fasit. Alt er syntetisk/illustrativt.

export type Aktor = "ag" | "sm";

/** Nivå 1 = lav, 3 = høy. Gjelder både innsats (kompleksitet) og effekt. */
export type Niva = 1 | 2 | 3;

/** Plassering i utvelgelsen. */
export type Tier =
  | "pakke1" // foreslått i første pakke
  | "vurder" // god kandidat, men ikke i kjernen av pakke 1
  | "senere"; // bør vente (lav effekt/høy innsats, eller parkert)

export type SelectionTiltak = {
  id: string; // "T01" / "ST05"
  aktor: Aktor;
  title: string;
  /** Klynge/steg tiltaket hører til (fra referansemodellene). */
  steg: string;
  /** Innsats / kompleksitet (1 lav – 3 høy). UTKAST. */
  innsats: Niva;
  /** Forventet effekt (1 lav – 3 høy). UTKAST. */
  effekt: Niva;
  tier: Tier;
  /** For pakke1: kjernetiltak (bærer pakken) vs. støtte (billig forsterker). */
  kjerne?: boolean;
  /** Satt = blokkert/avhengig: avklaring, eierskap eller teknisk forutsetning. */
  blokkertAv?: string;
  /** Kort etisk merknad (FORGOOD) der det krever varsomhet. */
  forgood?: string;
  /** Toveis kobling: tilsvarende steg/tiltak i det andre sporet (vårt grep). */
  toveis?: string;
  /** Hvorfor (ikke) i pakke 1 — begrunnelse mot kriteriene. */
  hvorfor?: string;
};

export const aktorLabel: Record<Aktor, string> = {
  ag: "Arbeidsgiver",
  sm: "Den sykmeldte",
};

export const innsatsLabels: Record<Niva, string> = {
  1: "Lav innsats",
  2: "Middels",
  3: "Høy innsats",
};

export const effektLabels: Record<Niva, string> = {
  3: "Høy effekt",
  2: "Middels",
  1: "Lav effekt",
};

/** Kriteriene en plass i FØRSTE pakke vurderes mot (prioritert rekkefølge). */
export const pakke1Kriterier = [
  "Treffer det høyeste løftepunktet — stillheten før 4-ukers-fristen (tidlig signal + behovsvurdering), ikke spredt tynt utover alle steg.",
  "Gjennomførbart nå — scoping «dulting», ikke blokkert av avklaring, på flater vi eier eller samarbeider om.",
  "Lav etisk risiko — FORGOOD/guardrails grønt, «informere, aldri presse».",
  "Målbart — har et primært atferds-/opplevelsesmåletegn og en virkningshypotese.",
  "Helst en toveis kobling — samme touchpoint for begge aktører (vårt distinkte grep).",
];

export const utkastNote =
  "Effekt- og innsats-anslagene er et utkast utledet fra register- og scoping-docs. De er et utgangspunkt for kalibrering med teamet, ikke en fasit.";

// Arbeidsgiver — T01–T14 (kidult-reference-model: k1–k5 + støtte T13/T14).
const agTiltak: SelectionTiltak[] = [
  {
    id: "T01",
    aktor: "ag",
    title: "Varsel før uke 4",
    steg: "1 · Varsel og frist",
    innsats: 2,
    effekt: 3,
    tier: "pakke1",
    kjerne: true,
    blokkertAv: "Åpent: eksakt uke + om eksternt varsel (SMS/e-post) i tillegg",
    toveis: "ST04 (sykmeldt får tidsriktig signal samtidig)",
    hvorfor:
      "Selve kjernenudgen — bryter stillheten før fristen. Hele reise-analysen peker hit.",
  },
  {
    id: "T02",
    aktor: "ag",
    title: "Frist på riktig person",
    steg: "1 · Varsel og frist",
    innsats: 1,
    effekt: 3,
    tier: "pakke1",
    kjerne: true,
    hvorfor:
      "Gjør passiv sykmeldingsinfo til en konkret oppgave på riktig person — høy effekt, lav innsats.",
  },
  {
    id: "T03",
    aktor: "ag",
    title: "Personnær vurderingsoppgave",
    steg: "2 · Behovsvurdering",
    innsats: 2,
    effekt: 3,
    tier: "pakke1",
    kjerne: true,
    toveis: "ST05 (sykmeldtes egen behovsvurdering)",
    hvorfor: "Får behovsvurderingen til å faktisk skje — ikke bare navigasjon.",
  },
  {
    id: "T04",
    aktor: "ag",
    title: "Plan trengs ikke nå",
    steg: "2 · Behovsvurdering",
    innsats: 2,
    effekt: 2,
    tier: "pakke1",
    kjerne: true,
    blokkertAv: "Fritekst-årsak krever PII-/juridisk avklaring",
    forgood: "Må ikke bli snarvei bort fra oppfølgingsplikten; ingen default.",
    hvorfor:
      "Gjør «nei» til et ærlig, registrert valg — fullfører beslutningspunktet.",
  },
  {
    id: "T05",
    aktor: "ag",
    title: "Miniguide og stegvis plan",
    steg: "3 · Stegvis planflyt",
    innsats: 3,
    effekt: 2,
    tier: "senere",
    hvorfor:
      "Verdifull, men en større ombygging av planflyten — etter pakke 1.",
  },
  {
    id: "T06",
    aktor: "ag",
    title: "Aktiv plan kan justeres",
    steg: "3 · Stegvis planflyt",
    innsats: 2,
    effekt: 2,
    tier: "senere",
  },
  {
    id: "T07",
    aktor: "ag",
    title: "Utkast og fremdrift",
    steg: "3 · Stegvis planflyt",
    innsats: 2,
    effekt: 1,
    tier: "senere",
  },
  {
    id: "T08",
    aktor: "ag",
    title: "Evalueringsdato som ny samtale",
    steg: "4 · Evaluering og påminnelse",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
    hvorfor:
      "Billig og nyttig, men ikke ved «muren» — kandidat til neste pakke.",
  },
  {
    id: "T09",
    aktor: "ag",
    title: "Kalender og opt-in påminnelse",
    steg: "4 · Evaluering og påminnelse",
    innsats: 2,
    effekt: 2,
    tier: "senere",
    forgood: "Ingen skjult default på varsling.",
  },
  {
    id: "T10",
    aktor: "ag",
    title: "Hvorfor dele med lege og Nav",
    steg: "5 · Deling",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
  },
  {
    id: "T11",
    aktor: "ag",
    title: "Tilrettelegging som virker/ikke virker",
    steg: "5 · Deling",
    innsats: 2,
    effekt: 2,
    tier: "senere",
    forgood: "Ikke be om diagnose eller private forhold.",
  },
  {
    id: "T12",
    aktor: "ag",
    title: "Lagring og gjenbruk av plan",
    steg: "5 · Deling",
    innsats: 2,
    effekt: 1,
    tier: "senere",
  },
  {
    id: "T13",
    aktor: "ag",
    title: "Verdi og plikt i klarspråk",
    steg: "Støttelag (gjennomgående)",
    innsats: 1,
    effekt: 2,
    tier: "pakke1",
    kjerne: false,
    hvorfor:
      "Billig forsterker som løfter alle de andre — klarspråk på plikt og verdi der nudgene lever.",
  },
  {
    id: "T14",
    aktor: "ag",
    title: "Samlet innhold og begrepsrydding",
    steg: "Støttelag (gjennomgående)",
    innsats: 3,
    effekt: 2,
    tier: "senere",
    hvorfor: "Eget innholdsløp — for stort til å henge på første pakke.",
  },
];

// Sykmeldt — ST01–ST12 (sykmeldt-reference-model: s1–s5).
const smTiltak: SelectionTiltak[] = [
  {
    id: "ST01",
    aktor: "sm",
    title: "Plikt- og prosessinfo fra dag 1",
    steg: "1 · Tidlig info og plikt",
    innsats: 2,
    effekt: 2,
    tier: "pakke1",
    kjerne: false,
    blokkertAv: "Eierskap til flate (Flex «Ditt sykefravær» / Symfoni)",
    forgood: "Plikt skal opplyse, ikke true.",
    hvorfor:
      "Kunnskapsgrunnlaget — den sykmeldte forstår plikt og prosess fra dag 1, i lett språk.",
  },
  {
    id: "ST02",
    aktor: "sm",
    title: "Oppfordre tidlig kontakt + vis gevinsten",
    steg: "1 · Tidlig info og plikt",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
    toveis: "AG steg 01 (leder venter ofte på kontakt)",
  },
  {
    id: "ST03",
    aktor: "sm",
    title: "Vis hva leder skal gjøre (symmetri)",
    steg: "1 · Tidlig info og plikt",
    innsats: 1,
    effekt: 1,
    tier: "vurder",
    toveis: "AG steg 01 (samme bilde for begge)",
  },
  {
    id: "ST04",
    aktor: "sm",
    title: "Tidsriktig signal ~uke 4",
    steg: "2 · Signal og egen behovsvurdering",
    innsats: 2,
    effekt: 3,
    tier: "pakke1",
    kjerne: true,
    toveis: "AG steg 02 / T01 (begge minnes samtidig)",
    hvorfor:
      "Speiler AG-signalet — begge parter dultes mot samme moment før uke 4.",
  },
  {
    id: "ST05",
    aktor: "sm",
    title: "Egen behovsvurdering, delbar; ja → AG-varsel",
    steg: "2 · Signal og egen behovsvurdering",
    innsats: 3,
    effekt: 3,
    tier: "pakke1",
    kjerne: true,
    blokkertAv: "Åpent: hvem ser vurderingen + når utløses AG-varselet",
    forgood: "Tydelig samtykke; «ikke nå» må være et reelt valg.",
    toveis: "AG steg 03 / T03 (mulig felles behovsvurdering)",
    hvorfor:
      "Den toveis koblingen — vårt distinkte grep: ett «ja» setter begge parter i gang.",
  },
  {
    id: "ST06",
    aktor: "sm",
    title: "Kartleggingsspørsmål som ny anledning",
    steg: "2 · Signal og egen behovsvurdering",
    innsats: 3,
    effekt: 2,
    tier: "senere",
    blokkertAv:
      "Geografi-pilot (Troms/Finnmark) — kan ikke forutsettes nasjonalt",
  },
  {
    id: "ST07",
    aktor: "sm",
    title: "Forstå hva en plan er + gevinsten",
    steg: "3 · Forstå og forberede planen",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
  },
  {
    id: "ST08",
    aktor: "sm",
    title: "Forberedelsesskjema til samtalen",
    steg: "3 · Forstå og forberede planen",
    innsats: 2,
    effekt: 2,
    tier: "senere",
    toveis: "AG steg 04 (samtale og planarbeid)",
  },
  {
    id: "ST09",
    aktor: "sm",
    title: "«Sykmeldt fra oppgavene» — medvirkningsrommet",
    steg: "3 · Forstå og forberede planen",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
    forgood: "Aldri «du burde jobbe mer» — helsen styrer.",
    hvorfor: "Billig framing med stor opplevd verdi — kandidat til støtte.",
  },
  {
    id: "ST10",
    aktor: "sm",
    title: "Sykmeldt medvirker i og deler planen",
    steg: "4 · Medvirkning og deling",
    innsats: 3,
    effekt: 3,
    tier: "senere",
    blokkertAv: "Teknisk: sykmeldt skriver ikke i planen i dag",
    hvorfor:
      "Høy effekt, men teknisk forutsetning mangler — blokkert til den er på plass.",
  },
  {
    id: "ST11",
    aktor: "sm",
    title: "Evalueringsdato + påminnelse + mal",
    steg: "5 · Evaluering og kontinuitet",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
    toveis: "AG steg 06 (evaluering)",
  },
  {
    id: "ST12",
    aktor: "sm",
    title: "Evalueringsside + flere planer",
    steg: "5 · Evaluering og kontinuitet",
    innsats: 2,
    effekt: 2,
    tier: "senere",
  },
];

export const selectionTiltak: SelectionTiltak[] = [...agTiltak, ...smTiltak];

/** Tiltak i en gitt celle av effekt×innsats-matrisen, valgfritt filtrert på aktør. */
export function tiltakAt(
  innsats: Niva,
  effekt: Niva,
  aktor?: Aktor,
): SelectionTiltak[] {
  return selectionTiltak.filter(
    (t) =>
      t.innsats === innsats &&
      t.effekt === effekt &&
      (aktor ? t.aktor === aktor : true),
  );
}

/** Forslaget til første pakke, valgfritt filtrert på aktør. */
export function pakke1(aktor?: Aktor): SelectionTiltak[] {
  return selectionTiltak.filter(
    (t) => t.tier === "pakke1" && (aktor ? t.aktor === aktor : true),
  );
}
