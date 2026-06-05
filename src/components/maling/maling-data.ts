// Syntetisk data- og aggregatmodell for måle-dashboardet (/maling).
//
// ALLE TALL ER SYNTETISKE. Ingen live data, ingen personer, ingen DB.
// Studio viser GODKJENTE AGGREGATER fra datamarkedsplassen — ikke rådata.
// Data Science (DS) eier rådata, modellering, forløpsdefinisjon og aggregering.
//
// Modellen skiller bevisst to ting som ofte blandes sammen:
//   1. ARM  — kontroll vs. tiltakspakke. Tildeles på underenhet (Lisa-allokering).
//   2. RESPONS — takket ja / ikke svart på spørsmål om påminnelse. Dette er et
//      analyse-/filterlag inni pakke-armen, ikke en egen randomisert arm.

// ---- armer og segmenter ----

export type Arm = "kontroll" | "pakke";
export type ResponsSegment = "takket-ja" | "ikke-svart";
export type Segment = "alle" | ResponsSegment;

export const SEGMENTER: Segment[] = ["alle", "takket-ja", "ikke-svart"];

export const SEGMENT_LABEL: Record<Segment, string> = {
  alle: "Alle i tiltakspakka",
  "takket-ja": "Takket ja",
  "ikke-svart": "Ikke svart",
};

export const SEGMENT_FORKLARING: Record<Segment, string> = {
  alle: "Alle i tiltakspakka sammenlignes med kontroll. Dette er hovedtallet.",
  "takket-ja":
    "Takket ja til påminnelse. Gruppen kan være mer motivert fra før, så dette viser forskjell, ikke ren effekt.",
  "ikke-svart":
    "Har fått tiltakspakka, men svarte ikke på spørsmålet om påminnelse. Brukes som sammenligning inni pakka.",
};

// Andel av pakke-armen i hver responsgruppe. Vekter pool-tallet «Alle i pakka».
export const SEGMENT_ANDEL: Record<ResponsSegment, number> = {
  "takket-ja": 55,
  "ikke-svart": 45,
};

// ---- generiske tall-typer ----

export type SegmentTall = {
  "takket-ja": number;
  "ikke-svart": number;
};

const RESPONS_VERDIER: ResponsSegment[] = ["takket-ja", "ikke-svart"];

export function parseSegmentParam(param: string | null): Segment {
  if (!param) return "alle";
  const [dim, val] = param.split(":");
  if (dim !== "respons") return "alle";
  return (RESPONS_VERDIER as string[]).includes(val)
    ? (val as Segment)
    : "alle";
}

export function segmentToParam(seg: Segment): string {
  return seg === "alle" ? "" : `respons:${seg}`;
}

export type ArmMetrikk = {
  kontroll: number;
  pakke: SegmentTall;
};

const W = {
  "takket-ja": SEGMENT_ANDEL["takket-ja"] / 100,
  "ikke-svart": SEGMENT_ANDEL["ikke-svart"] / 100,
} as const;

/** Vektet pakke-pool (segment = «alle»). */
export function poolTall(s: SegmentTall): number {
  return Math.round(
    W["takket-ja"] * s["takket-ja"] + W["ikke-svart"] * s["ikke-svart"],
  );
}

/** Pakke-tall for valgt segment. «alle» gir vektet pool. */
export function pakkeForSegment(m: ArmMetrikk, seg: Segment): number {
  return seg === "alle" ? poolTall(m.pakke) : m.pakke[seg];
}

export function erResponsSegment(seg: Segment): boolean {
  return seg !== "alle";
}

// ---- forsøksdesign ----

export const FORSOKSDESIGN = {
  pilot: "Pilot · Troms og Finnmark",
  armer: [
    {
      arm: "pakke" as Arm,
      navn: "Tiltakspakke",
      beskrivelse:
        "Underenheter som får hele pakke 1: tidlig informasjon, opt-in-påminnelse, behovsvurdering og planstøtte.",
    },
    {
      arm: "kontroll" as Arm,
      navn: "Kontroll",
      beskrivelse:
        "Underenheter uten pakka. Følges med samme aggregater, tolket før/etter (diff-in-diff).",
    },
  ],
  tildelingsenhet: {
    tittel: "Tildelingsenhet: underenhet (virksomhet)",
    punkter: [
      "Underenhetens geografiske/adresse-tilhørighet bestemmer arm (Lisa sin foreløpige allokering).",
      "Alle nye sykmeldte i samme underenhet følger samme arm — pakke eller kontroll.",
      "Tilhørigheten er sticky så lenge personen hører til underenheten.",
    ],
  },
  maleenhet: {
    tittel: "Måleenhet: sykefraværsforløp / person",
    punkter: [
      "Hvert forløp følges over tid, fra sykmelding til evaluering.",
      "Effekt tolkes hierarkisk: forløp er nøstet i underenhet som er nøstet i arm.",
      "Respons på påminnelsen låses ved forløpets start, før utfallene.",
    ],
  },
  segment: {
    tittel: "Respons på påminnelse: filterlag, ikke arm",
    punkter: [
      "Påminnelsen er ett tiltak inni pakka. Du tilhører pakka uansett om du takker ja.",
      "Takket ja / ikke svart er selvvalgte responsgrupper. De viser mønster, ikke ren effekt.",
      "Responsgruppene brukes til å forstå mønstre, ikke som bevis for effekt.",
    ],
  },
} as const;

// ---- styringstall: KR1 / KR2 / KR3, pakke vs. kontroll ----

export type Styringstall = {
  id: "kr1" | "kr2" | "kr3";
  kr: string;
  tittel: string;
  enhet: "%";
  metrikk: ArmMetrikk;
  retning: "opp"; // høyere = bedre
  forklaring: MetrikkForklaring;
};

export type PlanHendelseId =
  | "opprettet"
  | "ferdigstilt"
  | "delt-lege"
  | "delt-nav";

export type PlanHendelse = {
  id: PlanHendelseId;
  label: string;
  kortLabel: string;
  styringstall: Styringstall;
  kurve: {
    kontroll: number[];
    pakke: SegmentKurve;
  };
  forklaring: MetrikkForklaring;
};

export const TID_TIL_PLAN_UKER = [1, 2, 3, 4, 5, 6, 7, 8];

export const PLAN_HENDELSER: PlanHendelse[] = [
  {
    id: "opprettet",
    label: "Plan opprettet",
    kortLabel: "opprettet",
    styringstall: {
      id: "kr1",
      kr: "KR1",
      tittel: "Plan opprettet ≤ uke 4",
      enhet: "%",
      metrikk: {
        kontroll: 34,
        pakke: { "takket-ja": 68, "ikke-svart": 41 },
      },
      retning: "opp",
      forklaring: {
        definisjon:
          "Andel forløp der en oppfølgingsplan er opprettet innen utgangen av uke 4.",
        krKobling: "KR1 — flere og tidligere oppfølgingsplaner.",
        datakilde:
          "Aggregat fra register: planer fra Nav + LPS, talt på tvers av begge apper.",
        tidsvindu: "Uke 1–4 etter sykmeldingsstart.",
        segmenter:
          "Alle i tiltakspakka mot kontroll er hovedtallet. Responsgrupper er analyse.",
        tolkning:
          "Hovedtallet sier om pakka flytter planarbeidet. Responsgrupper viser hvem som ser ut til å handle mest.",
        usikkerhet:
          "Andeler vises med 95 % konfidensintervall i datamarkedsproduktet.",
      },
    },
    kurve: {
      kontroll: [1, 3, 8, 18, 24, 29, 32, 34],
      pakke: {
        "takket-ja": [2, 9, 26, 49, 58, 63, 66, 68],
        "ikke-svart": [1, 4, 11, 24, 31, 37, 40, 41],
      },
    },
    forklaring: {
      definisjon:
        "Kumulativ andel forløp der planen er opprettet, uke for uke.",
      krKobling: "KR1 — viser når planarbeidet starter.",
      datakilde: "Aggregat fra register: opprettet plan per forløp.",
      tidsvindu: "Uke 1–8. Uke 4 er fristen styringstallet leser av.",
      segmenter: "Kontroll er fast referanse. Filteret bytter pakke-linjen.",
      tolkning:
        "Bratt tidlig stigning betyr at flere kommer i gang før fristen.",
      usikkerhet: "Punktestimat per uke. Båndet er utelatt i skissen.",
    },
  },
  {
    id: "ferdigstilt",
    label: "Plan ferdigstilt",
    kortLabel: "ferdigstilt",
    styringstall: {
      id: "kr1",
      kr: "KR1",
      tittel: "Plan ferdigstilt ≤ uke 4",
      enhet: "%",
      metrikk: {
        kontroll: 28,
        pakke: { "takket-ja": 58, "ikke-svart": 35 },
      },
      retning: "opp",
      forklaring: {
        definisjon:
          "Andel forløp der planen er ferdigstilt innen utgangen av uke 4.",
        krKobling: "KR1 — planen er ikke bare startet, men gjort ferdig.",
        datakilde: "Aggregat fra register: ferdigstilt plan per forløp.",
        tidsvindu: "Uke 1–4 etter sykmeldingsstart.",
        segmenter: "Alle i tiltakspakka mot kontroll er hovedtallet.",
        tolkning:
          "Viser om pakka flytter faktisk ferdigstilling, ikke bare oppstart.",
        usikkerhet:
          "Andeler vises med 95 % konfidensintervall i datamarkedsproduktet.",
      },
    },
    kurve: {
      kontroll: [0, 2, 6, 14, 20, 24, 27, 28],
      pakke: {
        "takket-ja": [1, 6, 19, 40, 49, 54, 57, 58],
        "ikke-svart": [0, 3, 8, 20, 27, 31, 34, 35],
      },
    },
    forklaring: {
      definisjon:
        "Kumulativ andel forløp der planen er ferdigstilt, uke for uke.",
      krKobling: "KR1 — viser når planen faktisk blir ferdig.",
      datakilde: "Aggregat fra register: ferdigstilt plan per forløp.",
      tidsvindu: "Uke 1–8. Uke 4 er fristen styringstallet leser av.",
      segmenter: "Kontroll er fast referanse. Filteret bytter pakke-linjen.",
      tolkning:
        "Forskjell mot opprettet plan viser om folk starter, men stopper før planen er ferdig.",
      usikkerhet: "Punktestimat per uke. Båndet er utelatt i skissen.",
    },
  },
  {
    id: "delt-lege",
    label: "Delt med lege",
    kortLabel: "delt med lege",
    styringstall: {
      id: "kr1",
      kr: "KR1",
      tittel: "Plan delt med lege ≤ uke 4",
      enhet: "%",
      metrikk: {
        kontroll: 18,
        pakke: { "takket-ja": 41, "ikke-svart": 22 },
      },
      retning: "opp",
      forklaring: {
        definisjon:
          "Andel forløp der planen er delt med lege innen utgangen av uke 4.",
        krKobling: "KR1 — planen når legen tidlig nok til å påvirke dialogen.",
        datakilde: "Aggregat fra register: deling med lege per forløp.",
        tidsvindu: "Uke 1–4 etter sykmeldingsstart.",
        segmenter: "Alle i tiltakspakka mot kontroll er hovedtallet.",
        tolkning:
          "Dette er strengere enn å opprette plan. Gapet viser om planen faktisk deles.",
        usikkerhet:
          "Andeler vises med 95 % konfidensintervall i datamarkedsproduktet.",
      },
    },
    kurve: {
      kontroll: [0, 1, 4, 9, 12, 15, 17, 18],
      pakke: {
        "takket-ja": [0, 3, 12, 28, 34, 38, 40, 41],
        "ikke-svart": [0, 1, 5, 12, 16, 19, 21, 22],
      },
    },
    forklaring: {
      definisjon:
        "Kumulativ andel forløp der planen er delt med lege, uke for uke.",
      krKobling: "KR1 — viser når planen blir nyttig i lege-dialogen.",
      datakilde: "Aggregat fra register: deling med lege per forløp.",
      tidsvindu: "Uke 1–8. Uke 4 er fristen styringstallet leser av.",
      segmenter: "Kontroll er fast referanse. Filteret bytter pakke-linjen.",
      tolkning:
        "Hvis opprettet plan øker, men delt med lege står stille, har vi laget dokumenter uten flyt.",
      usikkerhet: "Punktestimat per uke. Båndet er utelatt i skissen.",
    },
  },
  {
    id: "delt-nav",
    label: "Delt med Nav",
    kortLabel: "delt med Nav",
    styringstall: {
      id: "kr1",
      kr: "KR1",
      tittel: "Plan delt med Nav ≤ uke 4",
      enhet: "%",
      metrikk: {
        kontroll: 9,
        pakke: { "takket-ja": 24, "ikke-svart": 13 },
      },
      retning: "opp",
      forklaring: {
        definisjon:
          "Andel forløp der planen er delt med Nav innen utgangen av uke 4.",
        krKobling: "KR1 — planen når Nav tidlig nok til å støtte oppfølgingen.",
        datakilde: "Aggregat fra register: deling med Nav per forløp.",
        tidsvindu: "Uke 1–4 etter sykmeldingsstart.",
        segmenter: "Alle i tiltakspakka mot kontroll er hovedtallet.",
        tolkning:
          "Dette er den strengeste KR1-varianten og må tolkes sammen med uke-8-kravet.",
        usikkerhet:
          "Andeler vises med 95 % konfidensintervall i datamarkedsproduktet.",
      },
    },
    kurve: {
      kontroll: [0, 0, 2, 5, 8, 11, 14, 15],
      pakke: {
        "takket-ja": [0, 1, 6, 17, 23, 28, 31, 33],
        "ikke-svart": [0, 1, 3, 9, 12, 15, 18, 19],
      },
    },
    forklaring: {
      definisjon:
        "Kumulativ andel forløp der planen er delt med Nav, uke for uke.",
      krKobling: "KR1 — viser når planen blir synlig for Nav.",
      datakilde: "Aggregat fra register: deling med Nav per forløp.",
      tidsvindu: "Uke 1–8. Uke 4 er første frist, uke 8 er kontrollpunkt.",
      segmenter: "Kontroll er fast referanse. Filteret bytter pakke-linjen.",
      tolkning:
        "Kurven viser om deling med Nav kommer tidlig nok, eller først etter at fristen nærmer seg.",
      usikkerhet: "Punktestimat per uke. Båndet er utelatt i skissen.",
    },
  },
];

export function planHendelseById(id: PlanHendelseId): PlanHendelse {
  return PLAN_HENDELSER.find((h) => h.id === id) ?? PLAN_HENDELSER[0];
}

export function styringstallForHendelse(id: PlanHendelseId): Styringstall[] {
  return [planHendelseById(id).styringstall, ...STYRINGSTALL_FASTE];
}

export const STYRINGSTALL_FASTE: Styringstall[] = [
  {
    id: "kr2",
    kr: "KR2",
    tittel: "Tar stilling til behov ≤ uke 4",
    enhet: "%",
    metrikk: {
      kontroll: 29,
      pakke: { "takket-ja": 60, "ikke-svart": 35 },
    },
    retning: "opp",
    forklaring: {
      definisjon:
        "Andel forløp der behovet for oppfølging er aktivt vurdert innen uke 4 — også «ikke nå» med begrunnelse.",
      krKobling: "KR2 — stilling til behov innen fristen.",
      datakilde:
        "Aggregat fra register: registrert behovsvurdering per forløp.",
      tidsvindu: "Kalenderuke 1–4 etter sykmeldingsstart.",
      segmenter: "Pakke vs. kontroll styrer. Filteret viser segment-detaljer.",
      tolkning:
        "Måler at folk faktisk tar et valg i tide, ikke bare at de lager papir.",
      usikkerhet:
        "95 % konfidensintervall. Celler under minste celletall undertrykkes.",
    },
  },
  {
    id: "kr3",
    kr: "KR3",
    tittel: "Plan før Nav-purring",
    enhet: "%",
    metrikk: {
      kontroll: 12,
      pakke: { "takket-ja": 38, "ikke-svart": 16 },
    },
    retning: "opp",
    forklaring: {
      definisjon:
        "Andel forløp der planen er laget før Nav-purring eller veilederforespørsel kom.",
      krKobling: "KR3 — proaktiv planlegging uten å vente på Nav.",
      datakilde:
        "Aggregat fra register: plan-tidspunkt sammenlignet med forespørsel-tidspunkt.",
      tidsvindu: "Hele forløpet fram til første forespørsel fra Nav.",
      segmenter: "Pakke vs. kontroll styrer. Segment-splitt er analyse.",
      tolkning:
        "Distinkt proaktivitetssignal, hardt målbart. Sekundærsignal: andel som i det hele tatt får purring.",
      usikkerhet: "95 % konfidensintervall.",
      guardrail:
        "Skal ikke drives av frykt for sanksjon — kobles mot opplevd press i Lumi.",
    },
  },
];

// Sekundærsignal til KR3 — lavere = bedre.
export const PURRING_ANDEL: ArmMetrikk = {
  kontroll: 41,
  pakke: { "takket-ja": 18, "ikke-svart": 33 },
};

// ---- KR1 læringsvisning: tid til første plan (survival-lignende) ----

export type SegmentKurve = {
  "takket-ja": number[];
  "ikke-svart": number[];
};

export function poolKurve(k: SegmentKurve): number[] {
  return k["takket-ja"].map((_, i) =>
    Math.round(
      W["takket-ja"] * k["takket-ja"][i] + W["ikke-svart"] * k["ikke-svart"][i],
    ),
  );
}

export function pakkeKurveForSegment(
  hendelseId: PlanHendelseId,
  seg: Segment,
): number[] {
  const pakke = planHendelseById(hendelseId).kurve.pakke;
  return seg === "alle" ? poolKurve(pakke) : pakke[seg];
}

// ---- prompt-timing: traff påminnelsen mens det var tid? ----

export type TimingBøtte = {
  label: string;
  andel: number;
  iTide: boolean;
  merknad: string;
};

export const PROMPT_TIMING: TimingBøtte[] = [
  {
    label: "Uke 1–2",
    andel: 38,
    iTide: true,
    merknad: "God margin til behovsvurdering og plan før uke 4.",
  },
  {
    label: "Uke 3",
    andel: 34,
    iTide: true,
    merknad: "Fortsatt tid til å handle før fristen.",
  },
  {
    label: "Uke 4",
    andel: 18,
    iTide: true,
    merknad: "Knapp margin — treffer akkurat fristen.",
  },
  {
    label: "Etter uke 4",
    andel: 10,
    iTide: false,
    merknad: "For sent: fristen er passert før påminnelsen traff.",
  },
];

export const PROMPT_TIMING_FORKLARING: MetrikkForklaring = {
  definisjon:
    "Når i forløpet opt-in-påminnelsen traff, målt mot uke-4-fristen.",
  krKobling: "Mekanisme bak KR1/KR2 — riktig timing er en forutsetning.",
  datakilde: "Aggregat fra register: varseltidspunkt mot forløpsstart.",
  tidsvindu: "Uke 1 til etter uke 4.",
  segmenter: "Gjelder opt-in-segmentet — de som faktisk får påminnelsen.",
  tolkning:
    "En påminnelse som kommer etter uke 4 kan ikke ha hjulpet planen i tide.",
  usikkerhet: "Andeler er syntetiske; reelt produkt ville hatt KI.",
  guardrail: "For sene varsler skal lukes ut, ikke telles som dult.",
};

// ---- standardvalg / varsling: segment + etikkspor ----

export type VarselValg = {
  status: string;
  andel: number;
  forklaring: string;
};

export const VARSEL_VALG: VarselValg[] = [
  {
    status: "Takket ja",
    andel: 55,
    forklaring: "Tok aktivt valg om å få påminnelse.",
  },
  {
    status: "Ikke svart",
    andel: 45,
    forklaring: "Har ikke svart på spørsmålet. Da sendes det ikke påminnelse.",
  },
];

export const VARSEL_ETIKK = {
  punkter: [
    "Tidspunkt for valget logges som aggregat, så vi ser om folk velger tidlig eller presses sent.",
    "Valget kobles mot om det finnes en tidligere plan — vi vil ikke mase når jobben er gjort.",
    "Opplevd press/mas måles i Lumi som guardrail, ikke som suksessmål.",
    "Responsgrupper framstilles aldri som ren effekt: hvem som takker ja kan være mer motivert fra før.",
  ],
  pressFelt: { kontroll: 6, pakke: 9 }, // opplevd press (Lumi), lavere = bedre
};

// ---- Lumi: mekanisme- og guardrail-lag ----

// 5-punkts «i hvilken grad»-skala (1 = i svært liten grad, 5 = i svært stor grad).
// Snittscore per arm/segment og aktør. Hard effekt måles i register, ikke her.
export type LumiAktorScore = { ag: number; sm: number };
export type LumiSpørsmål = {
  q: string;
  tag: string;
  status: "bra" | "følg-med";
  kontroll: LumiAktorScore;
  pakke: {
    "takket-ja": LumiAktorScore;
    "ikke-svart": LumiAktorScore;
  };
};

export const LUMI_SKALA = "1 = i svært liten grad · 5 = i svært stor grad";

export const LUMI_SPORSMAL: LumiSpørsmål[] = [
  {
    q: "Forstår folk hvorfor tidlig oppfølging er viktig?",
    tag: "forståelse",
    status: "bra",
    kontroll: { ag: 3.1, sm: 2.8 },
    pakke: {
      "takket-ja": { ag: 4.3, sm: 4.0 },
      "ikke-svart": { ag: 3.6, sm: 3.3 },
    },
  },
  {
    q: "Kommer arbeidsgiver og den sykmeldte tidligere i kontakt?",
    tag: "tidlig-kontakt",
    status: "bra",
    kontroll: { ag: 2.9, sm: 2.6 },
    pakke: {
      "takket-ja": { ag: 4.0, sm: 3.7 },
      "ikke-svart": { ag: 3.3, sm: 3.0 },
    },
  },
  {
    q: "Oppleves påminnelsene som støtte, ikke press?",
    tag: "støtte-ikke-press",
    status: "følg-med",
    kontroll: { ag: 3.4, sm: 3.0 },
    pakke: {
      "takket-ja": { ag: 3.9, sm: 3.5 },
      "ikke-svart": { ag: 3.5, sm: 3.2 },
    },
  },
  {
    q: "Finner de tilrettelegging som kan fungere?",
    tag: "tilrettelegging",
    status: "følg-med",
    kontroll: { ag: 2.7, sm: 2.5 },
    pakke: {
      "takket-ja": { ag: 3.5, sm: 3.3 },
      "ikke-svart": { ag: 3.0, sm: 2.9 },
    },
  },
  {
    q: "Vet folk hva de selv kan bidra med?",
    tag: "egen-rolle",
    status: "bra",
    kontroll: { ag: 3.0, sm: 2.7 },
    pakke: {
      "takket-ja": { ag: 4.1, sm: 3.8 },
      "ikke-svart": { ag: 3.4, sm: 3.1 },
    },
  },
];

export function lumiForSegment(s: LumiSpørsmål, seg: Segment): LumiAktorScore {
  if (seg === "alle") {
    const p = s.pakke;
    return {
      ag: round1(
        W["takket-ja"] * p["takket-ja"].ag +
          W["ikke-svart"] * p["ikke-svart"].ag,
      ),
      sm: round1(
        W["takket-ja"] * p["takket-ja"].sm +
          W["ikke-svart"] * p["ikke-svart"].sm,
      ),
    };
  }
  return s.pakke[seg];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ---- funnel: diagnoseverktøy ----

export type FunnelSteg = {
  label: string;
  sub: string;
  kontroll: number;
  pakke: SegmentTall;
};

export const FUNNEL: FunnelSteg[] = [
  {
    label: "Sykmelding mottatt",
    sub: "kohort-inngang",
    kontroll: 100,
    pakke: { "takket-ja": 100, "ikke-svart": 100 },
  },
  {
    label: "Lager plan",
    sub: "påminnelse ~uke 4",
    kontroll: 34,
    pakke: { "takket-ja": 68, "ikke-svart": 41 },
  },
  {
    label: "Deler med legen",
    sub: "≤ uke 4",
    kontroll: 18,
    pakke: { "takket-ja": 41, "ikke-svart": 22 },
  },
  {
    label: "Deler med Nav",
    sub: "≤ uke 8",
    kontroll: 15,
    pakke: { "takket-ja": 33, "ikke-svart": 19 },
  },
  {
    label: "Fortsatt aktiv",
    sub: "evaluering valgt",
    kontroll: 11,
    pakke: { "takket-ja": 26, "ikke-svart": 14 },
  },
];

// ---- lang horisont: bekreftende, DS-/fag-definert ----

export const LANG_HORISONT = {
  gradertAndel: {
    tittel: "Andel forløp med minst én gradering",
    enhet: "%",
    kontroll: 31,
    pakke: 38,
    status: "klar" as const,
  },
  tidTilGradering: {
    tittel: "Tid til første gradering",
    enhet: "uker (median)",
    kontroll: 6.4,
    pakke: 5.1,
    status: "klar" as const,
  },
  fraværslengde: {
    tittel: "Fraværslengde",
    enhet: "dager (median)",
    kontroll: 46,
    pakke: 41,
    status: "venter" as const,
    venterPå:
      "Krever godkjent forløpsdefinisjon fra fag/DS før tallet kan brukes.",
  },
};

// ---- datagrunnlag / aggregatkontrakt ----

export const DATAGRUNNLAG = {
  produkt: "tiltakspakke-1-aggregater (datamarkedsplass)",
  eier: "Data Science (DS) — eier rådata, modellering og aggregering",
  rolleStudio:
    "Studio konsumerer kun ferdige, godkjente aggregater. Ingen rådata eller persondata passerer her.",
  kontrakt: [
    {
      tittel: "Minste celletall",
      verdi: "5 forløp",
      tekst: "Celler med færre enn 5 forløp undertrykkes og vises som «–».",
    },
    {
      tittel: "Suppresjon",
      verdi: "Sekundær",
      tekst:
        "Tilstøtende celler undertrykkes ved behov så undertrykte tall ikke kan regnes ut bakveien.",
    },
    {
      tittel: "Usikkerhet",
      verdi: "95 % KI",
      tekst: "Alle andeler leveres med konfidensintervall fra DS.",
    },
    {
      tittel: "Definisjonsversjon",
      verdi: "forløpsdef v0.9",
      tekst:
        "Utkast, ikke godkjent. Fraværslengde låses til denne er faggodkjent.",
    },
    {
      tittel: "Oppdatering",
      verdi: "Ukentlig",
      tekst:
        "Snapshot per uke. Tall kan revideres når sene registreringer kommer inn.",
    },
  ],
};

// ---- felles forklaringstype ----

export type MetrikkForklaring = {
  definisjon: string;
  krKobling: string;
  datakilde: string;
  tidsvindu: string;
  segmenter: string;
  tolkning: string;
  usikkerhet: string;
  guardrail?: string;
};

// ---- periode-historikk og delta ----

export const PERIODER = ["Uke 9", "Uke 10", "Uke 11", "Uke 12"] as const;

// Syntetisk uke-historikk per KR (pakke-pool, alle-segment). Siste = dagens tall.
const KR_SERIE: Record<"kr1" | "kr2" | "kr3", number[]> = {
  kr1: [47, 51, 53, 56],
  kr2: [40, 44, 47, 49],
  kr3: [21, 24, 26, 28],
};

export function krSerie(id: "kr1" | "kr2" | "kr3"): number[] {
  return KR_SERIE[id];
}

export function deltaForrigePeriode(serie: number[], periode: number): number {
  if (periode <= 0) return 0;
  return serie[periode] - serie[periode - 1];
}

// ---- verdikt-beregning ----

export type KrTilstand = "paa-vei" | "folg-med" | "ikke-paa-vei";
const MARGIN_TERSKEL = 5; // prosentpoeng — illustrativ

export function krStatus(x: {
  pakke: number;
  kontroll: number;
  forrigeDelta: number;
}): KrTilstand {
  if (x.pakke < x.kontroll) return "ikke-paa-vei";
  if (x.pakke - x.kontroll < MARGIN_TERSKEL || x.forrigeDelta < 0) return "folg-med";
  return "paa-vei";
}

export function samletVerdikt(
  krer: readonly KrTilstand[],
  vakt: { mekanismeOk: boolean; guardrailOk: boolean },
): KrTilstand {
  if (krer.some((k) => k === "ikke-paa-vei")) return "ikke-paa-vei";
  const alleKrPaaVei = krer.every((k) => k === "paa-vei");
  if (alleKrPaaVei && vakt.mekanismeOk && vakt.guardrailOk) return "paa-vei";
  return "folg-med";
}
