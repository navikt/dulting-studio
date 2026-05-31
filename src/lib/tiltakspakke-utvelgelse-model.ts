// Utvelgelses-modell for FØRSTE tiltakspakke: legger de bearbeidede tiltakene
// (arbeidsgiver T01–T14 fra kidult-reference-model, sykmeldt ST01–ST12 fra
// sykmeldt-reference-model) på beslutnings-aksene effekt × innsats, med blokkert-
// flagg, guardrail, virkningshypotese (H1/H2), FORGOOD-merknad og toveis-kobling
// — pluss et forslag til pakke 1.
//
// VIKTIG: effekt/innsats-anslagene er et UTKAST utledet fra register- og scoping-
// docs (dulting-tiltaksregister*.md, dulting-scoping-status.md) + målmodellen
// (maalmodell-virkningshypotese.md). De er et utgangspunkt teamet kalibrerer,
// ikke en fasit. Alt er syntetisk/illustrativt.

export type Aktor = "ag" | "sm";

/** Nivå 1 = lav, 3 = høy. Gjelder både innsats (kompleksitet) og effekt. */
export type Niva = 1 | 2 | 3;

/** Plassering i utvelgelsen. */
export type Tier =
  | "pakke1" // foreslått i første pakke
  | "vurder" // god kandidat, men ikke i kjernen av pakke 1
  | "senere"; // bør vente (lav effekt/høy innsats, eller parkert)

/** Virkningshypotese fra maalmodell-virkningshypotese.md. */
export type HypoteseId = "H1" | "H2";

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
  /** Hvilke(n) virkningshypotese tiltaket lader opp til. */
  hypotese?: HypoteseId[];
  /** Satt = blokkert/avhengig: avklaring, eierskap eller teknisk forutsetning. */
  blokkertAv?: string;
  /** Stoppunkt/vakt (fra kilde-modellene) — synlig på beslutningslaget. */
  guardrail?: string;
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

export const hypoteseLabel: Record<HypoteseId, string> = {
  H1: "Tidligere oppfølging hos arbeidsgiver",
  H2: "Bedre informasjonsgrunnlag for fastlege",
};

/** Overordnede KR-er fra målmodellen (O1 · «Mål bak reisen»). */
export type KrId = "KR1" | "KR2" | "KR3" | "KR4" | "KR5";

export const krLabels: Record<KrId, string> = {
  KR1: "Flere oppfølgingsplaner — og tidligere",
  KR2: "Flere tar stilling til behov innen uke 4",
  KR3: "Plan sendt uten å vente på veileder",
  KR4: "Flere gjennomførte dialogmøte 1",
  KR5: "Økt gradert sykmelding · kortere sykefravær",
};

/** Kort etikett for chips. */
export const krKort: Record<KrId, string> = {
  KR1: "Flere/tidligere planer",
  KR2: "Stilling til behov ≤ uke 4",
  KR3: "Plan uten å vente",
  KR4: "Dialogmøte 1",
  KR5: "Gradert ↑ / kortere fravær",
};

/** Kriteriene en plass i FØRSTE pakke vurderes mot (prioritert rekkefølge). */
export const pakke1Kriterier = [
  "Treffer det høyeste løftepunktet — stillheten før 4-ukers-fristen (tidlig signal + behovsvurdering), ikke spredt tynt utover alle steg.",
  "Gjennomførbart nå — scoping «dulting», ikke blokkert av avklaring, på flater vi eier eller samarbeider om.",
  "Lav etisk risiko — FORGOOD/guardrails grønt, «informere, aldri presse».",
  "Målbart — har et primært atferds-/opplevelsesmåletegn og en virkningshypotese (H1/H2).",
  "Helst en toveis kobling — samme kontaktpunkt for begge aktører (vårt distinkte grep).",
];

/** Hvordan forslaget forholder seg til den vedtatte målmodellen (synlig ramme). */
export const pakke1Ramme =
  "Kjernen følger målmodellens to arbeidsgiver-hovedklynger — tidsriktig signal og behovsvurdering — pluss støttetekst (maalmodell-virkningshypotese.md §8). Sykmeldt-speilet er ST04 (kjerne) + ST01 (støtte). ST05 (det toveis grepet) er en bevisst, betinget utvidelse — «vurder», ikke låst kjerne — fordi AG eier planen, og samtykke/trigger + uenighets-håndtering må avklares først.";

export const utkastNote =
  "Effekt- og innsats-anslagene er et utkast utledet fra register- og scoping-docs. De er et utgangspunkt for kalibrering med teamet, ikke en fasit.";

// Arbeidsgiver — T01–T14 (kidult-reference-model: k1–k5 + støtte T13/T14).
const agTiltak: SelectionTiltak[] = [
  {
    id: "T01",
    aktor: "ag",
    title: "Tidsriktig oppgave på riktig person før uke 4",
    steg: "1 · Varsel og frist",
    innsats: 2,
    effekt: 3,
    tier: "pakke1",
    kjerne: true,
    hypotese: ["H1"],
    blokkertAv:
      "Åpent: eksakt uke + ekstern varsling (SMS/e-post) som målbart valg. Teknisk: deep-link til riktig person (DULT-23).",
    guardrail:
      "Unngå varseltrøtthet og for tidlig press; ikke dobbeltvarsle når plan/sak alt er avklart.",
    toveis: "ST04 (sykmeldt får tidsriktig signal samtidig)",
    hvorfor:
      "Kjernedulten — et tidsriktig varsel som lander som en konkret oppgave med frist på riktig person, bryter stillheten før fristen. Reise-analysen peker hit.",
  },
  {
    id: "T03",
    aktor: "ag",
    title: "Personnær vurderingsoppgave (med «nei»-gren)",
    steg: "2 · Behovsvurdering",
    innsats: 2,
    effekt: 3,
    tier: "pakke1",
    kjerne: true,
    hypotese: ["H1"],
    blokkertAv: "Fritekst-årsak ved «ikke nå» krever PII-/juridisk avklaring",
    guardrail:
      "Ikke mål bare navigasjon som suksess — det er stillingtaken som teller; ingen default; «ikke nå» må aktivt bekrefte at oppfølgingsplikten består.",
    forgood: "«Nei» må ikke bli en snarvei bort fra oppfølgingsplikten.",
    toveis: "ST05 (sykmeldtes egen behovsvurdering)",
    hvorfor:
      "Skal få behovsvurderingen til å faktisk skje — ikke bare navigasjon — og gjøre «nei» til et ærlig, registrert valg som fullfører beslutningspunktet.",
  },
  {
    id: "T05",
    aktor: "ag",
    title: "Stegvis plan",
    steg: "3 · Stegvis planflyt",
    innsats: 2,
    effekt: 1,
    tier: "senere",
    hypotese: ["H1"],
    hvorfor:
      "Lav prioritet: planen er liten, og frafall under utfylling er ikke observert. Miniguiden er skilt ut til klarspråk-laget (T13/ST07).",
  },
  {
    id: "T06",
    aktor: "ag",
    title: "Aktiv plan kan justeres",
    steg: "3 · Stegvis planflyt",
    innsats: 2,
    effekt: 2,
    tier: "senere",
    hypotese: ["H1"],
  },
  {
    id: "T07",
    aktor: "ag",
    title: "Utkast og fremdrift",
    steg: "3 · Stegvis planflyt",
    innsats: 2,
    effekt: 1,
    tier: "senere",
    hypotese: ["H1"],
  },
  {
    id: "T08",
    aktor: "ag",
    title: "Evalueringsdato + opt-in påminnelse",
    steg: "4 · Evaluering og påminnelse",
    innsats: 2,
    effekt: 2,
    tier: "vurder",
    hypotese: ["H1"],
    forgood: "Ingen skjult default på varsling (opt-in).",
    hvorfor:
      "Evalueringsdato som ny samtale + påminnelsen som gjør datoen til atferd. Billig og nyttig, men ikke ved «muren» — kandidat til neste pakke.",
  },
  {
    id: "T10",
    aktor: "ag",
    title: "Hvorfor dele med lege og Nav",
    steg: "5 · Deling",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
    hypotese: ["H2"],
  },
  {
    id: "T11",
    aktor: "ag",
    title: "Tilrettelegging som virker/ikke virker",
    steg: "5 · Deling",
    innsats: 2,
    effekt: 2,
    tier: "senere",
    hypotese: ["H2"],
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
    hypotese: ["H2"],
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
    hypotese: ["H1"],
    guardrail:
      "Teksten må ikke bli moraliserende, truende eller for lang, eller skyve mot feil valg.",
    hvorfor:
      "Billig forsterker som løfter alle de andre — klarspråk på plikt og verdi der dultene lever.",
  },
  {
    id: "T14",
    aktor: "ag",
    title: "Samlet innhold og begrepsrydding",
    steg: "Støttelag (gjennomgående)",
    innsats: 3,
    effekt: 2,
    tier: "senere",
    hypotese: ["H1"],
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
    hypotese: ["H1"],
    blokkertAv:
      "Eierskap til flate (Flex «Ditt sykefravær» / Symfoni) + tone i plikt-språket",
    guardrail: "Ikke overvelde dag 1; ikke bruk plikt som pisk.",
    forgood: "Plikt skal opplyse, ikke true.",
    hvorfor:
      "Sykmeldt-sidens klarspråk-støtte (motstykke til T13) — forstår plikt og prosess fra dag 1, i lett språk.",
  },
  {
    id: "ST02",
    aktor: "sm",
    title: "Oppfordre tidlig kontakt + vis gevinsten",
    steg: "1 · Tidlig info og plikt",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
    hypotese: ["H1"],
    toveis: "AG steg 01 (leder venter ofte på kontakt)",
  },
  {
    id: "ST03",
    aktor: "sm",
    title: "Vis hva leder skal gjøre (symmetri)",
    steg: "1 · Tidlig info og plikt",
    innsats: 1,
    effekt: 2,
    tier: "vurder",
    hypotese: ["H1"],
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
    hypotese: ["H1"],
    guardrail:
      "Unngå varseltrøtthet og duplikat når plan/vurdering finnes; ikke for tidlig press.",
    toveis: "AG steg 02 / T01 (begge minnes samtidig)",
    hvorfor:
      "Speiler AG-signalet — begge parter dultes mot samme moment før uke 4.",
  },
  {
    id: "ST05",
    aktor: "sm",
    title: "Egen behovsvurdering (delbar med Nav); ja → AG-varsel",
    steg: "2 · Signal og egen behovsvurdering",
    innsats: 3,
    effekt: 3,
    tier: "vurder",
    hypotese: ["H1", "H2"],
    blokkertAv:
      "Asymmetri: AG eier planen (sykmeldt kan i dag ikke skrive plan). Åpent: hvem ser vurderingen; «ja» → AG-varsel; håndtering ved uenighet (sykmeldt ja / AG nei).",
    guardrail:
      "Tydelig hvem som ser hva; ingen forhåndsvalgt default; «ikke nå» et reelt valg.",
    forgood:
      "Tydelig samtykke for deling med Nav; varsel kun på aktivt «ja», ikke automatisk.",
    toveis: "AG steg 03 / T03 (mulig felles behovsvurdering)",
    hvorfor:
      "Det distinkte toveis-grepet: sykmeldt signaliserer/ber → AG eier og bestemmer, men forespørselen er synlig og kan ikke ignoreres stille. «Vurder», ikke låst kjerne — forutsetter avklart samtykke/trigger + uenighets-håndtering (team/roadmap).",
  },
  {
    id: "ST06",
    aktor: "sm",
    title: "Kartleggingsspørsmål som ny anledning",
    steg: "2 · Signal og egen behovsvurdering",
    innsats: 3,
    effekt: 2,
    tier: "senere",
    hypotese: ["H1"],
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
    hypotese: ["H1"],
  },
  {
    id: "ST08",
    aktor: "sm",
    title: "Forberedelsesskjema til samtalen",
    steg: "3 · Forstå og forberede planen",
    innsats: 2,
    effekt: 2,
    tier: "senere",
    hypotese: ["H1"],
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
    hypotese: ["H1"],
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
    hypotese: ["H1", "H2"],
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
    hypotese: ["H1"],
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
    hypotese: ["H1"],
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

// ── Kobling til overordnede mål (KR) + prioritering ──────────────────────────
/**
 * Hvilke overordnede KR-er hvert tiltak ladrer opp til. UTKAST — kalibreres med
 * teamet, som effekt/innsats. KR5 (gradert / kortere fravær) nås i hovedsak via
 * H2: tidlig deling med fastlege gir bedre grunnlag for gradert sykmelding.
 */
export const tiltakKr: Record<string, KrId[]> = {
  // Arbeidsgiver
  T01: ["KR1", "KR2", "KR3"],
  T03: ["KR1", "KR2", "KR3"],
  T05: ["KR1"],
  T06: ["KR1"],
  T07: ["KR1"],
  T08: [],
  T10: ["KR5"],
  T11: ["KR5"],
  T12: ["KR1"],
  T13: ["KR1", "KR2"],
  T14: [],
  // Den sykmeldte
  ST01: ["KR2"],
  ST02: ["KR1"],
  ST03: ["KR2"],
  ST04: ["KR1", "KR2"],
  ST05: ["KR1", "KR2", "KR5"],
  ST06: ["KR2"],
  ST07: ["KR1"],
  ST08: [],
  ST09: ["KR1"],
  ST10: ["KR1", "KR5"],
  ST11: [],
  ST12: ["KR1"],
};

export const krUtkastNote =
  "KR-koblingen er et utkast (som effekt/innsats) — hvilke overordnede mål hvert tiltak ladrer opp til. Kalibreres med teamet.";

export const krGradertNote =
  "KR5 (gradert sykmelding / kortere fravær) nås i hovedsak via H2: tidlig deling med fastlege gir bedre grunnlag for gradert sykmelding. Legen er en mekanisme og et effektmål her — ikke en primær bruker i denne pakken. Tiltakene som mater dette (T10, ST05, ST10) ligger i «vurder/senere», ikke i pakke 1.";

export function krFor(id: string): KrId[] {
  return tiltakKr[id] ?? [];
}

/** Bang for the buck: forventet effekt delt på innsats (høyere = mer igjen per krone). */
export function bangForBuck(t: SelectionTiltak): number {
  return t.effekt / t.innsats;
}

/** Tiltak sortert etter bang for the buck (synkende), valgfritt filtrert på aktør. */
export function prioritert(aktor?: Aktor): SelectionTiltak[] {
  return selectionTiltak
    .filter((t) => (aktor ? t.aktor === aktor : true))
    .sort((a, b) => bangForBuck(b) - bangForBuck(a) || b.effekt - a.effekt);
}

/** Per KR: tiltakene som ladrer opp til den (valgfritt filtrert på aktør). */
export function krDekning(aktor?: Aktor): Record<KrId, SelectionTiltak[]> {
  const out: Record<KrId, SelectionTiltak[]> = {
    KR1: [],
    KR2: [],
    KR3: [],
    KR4: [],
    KR5: [],
  };
  for (const t of selectionTiltak) {
    if (aktor && t.aktor !== aktor) continue;
    for (const k of krFor(t.id)) out[k].push(t);
  }
  return out;
}
