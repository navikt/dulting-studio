import type {
  BarriereKategori,
  MotivasjonsDriver,
} from "./sykmeldt-reference-model";

export type JourneyVariant = "today" | "package";

export type JourneyStepKind =
  | "today"
  | "silence"
  | "dulting"
  | "decision"
  | "outcome";

export type JourneyStep = {
  id: string;
  timeLabel?: string;
  title: string;
  body: string;
  action?: string;
  channel?: string;
  kind: JourneyStepKind;
  tiltakRefs?: string[];
  paths?: Array<{
    title: string;
    body: string;
    steps: string[];
  }>;
};

export type InterventionMapTiltak = {
  id: string;
  title: string;
  description: string;
  signal: string;
  guardrail: string;
  // Berikelse (UTKAST til kalibrering) — speiler sykmeldt-modellen så de to
  // tiltakskartene blir likeverdige. barriere/motivasjon er hentet fra det
  // steget tiltaket hører til i lederJourney; raakort fra dekningskartet i
  // docs/dulting-tiltaksregister.md; dult/maaletegn fra description/signal.
  // eastFogg + forgood er kvalitative utkast som teamet må verifisere.
  barriere?: BarriereKategori;
  motivasjon?: MotivasjonsDriver;
  dult?: string;
  eastFogg?: string;
  forgood?: string;
  raakort?: string[];
  /** Satt der AG-touchpointet speiler den sykmeldtes reise. */
  sharedWithSykmeldt?: string;
};

export type InterventionMapPhase = {
  id: string;
  number: number;
  title: string;
  behavior: string;
  measurement: string;
  tiltak: InterventionMapTiltak[];
  decisionPoint?: string;
};

export const journeyVariantLabels: Record<JourneyVariant, string> = {
  today: "I dag",
  package: "Med tiltakspakke",
};

export const journeySteps: JourneyStep[] = [
  {
    id: "sick-leave",
    timeLabel: "Dag 0-3",
    title: "Ansatt sykmeldes",
    body: "Ansatt får sykmelding fra lege. Logger inn på nav.no og sender sykmeldingen til arbeidsgiver.",
    kind: "today",
  },
  {
    id: "email",
    title: "Leder får e-post fra Nav",
    body: "En sykmelding er sendt til arbeidsgiver. Lenke til Dine sykmeldte.",
    action: "Leder klikker lenken og ser sykmeldingen.",
    channel: "E-post",
    kind: "today",
  },
  {
    id: "dine-sykmeldte",
    title: "Ser sykmelding i Dine sykmeldte",
    body: "Leder ser hvem som er syk, periode og grad. Det finnes informasjon, men ingen tydelig oppgave som ber lederen gjøre noe.",
    channel: "Dine sykmeldte",
    kind: "today",
  },
  {
    id: "silence",
    timeLabel: "Uke 1-3",
    title: "Ingenting skjer fra Nav",
    body: "Ingen påminnelse, ingen oppgave og ingen frist. Store bedrifter har ofte egne rutiner. Små bedrifter har ofte ingenting.",
    kind: "silence",
  },
  {
    id: "msag-task",
    timeLabel: "Uke 3-4",
    title: "Oppgave på Min side arbeidsgiver",
    body: "Arbeidsgiver får en oppgave om å vurdere om det trengs oppfølgingsplan. Teksten forklarer hva planen er, hvorfor den er nyttig, og hva fristen betyr.",
    action: "Lenke til den aktuelle personen i Dine sykmeldte.",
    channel: "Min side AG",
    kind: "dulting",
    tiltakRefs: ["T01"],
  },
  {
    id: "person-deadline",
    title: "Frist og oppgave på riktig person",
    body: "Inne på den sykmeldte vises en tydelig oppgave med frist. Ikke bare passiv informasjon, men en konkret ting å gjøre på riktig person.",
    action: "Vurder om dere trenger en oppfølgingsplan.",
    channel: "Dine sykmeldte",
    kind: "dulting",
    tiltakRefs: ["T02"],
  },
  {
    id: "need-assessment",
    title: "Behovsvurdering",
    body: "Leder svarer på et kort skjema: Trenger dere en oppfølgingsplan for denne personen? Strukturerte valg, ikke åpne fritekstfelt uten avklaring.",
    action: "Velger ja, lag plan eller nei, ikke nå.",
    channel: "Dine sykmeldte",
    kind: "dulting",
    tiltakRefs: ["T03"],
  },
  {
    id: "decision",
    timeLabel: "Veivalg",
    title: "Arbeidsgiver har tatt stilling",
    body: "Arbeidsgiver går videre i én av to tydelige retninger.",
    kind: "decision",
    paths: [
      {
        title: "Ja, vi trenger plan",
        body: "Leder tas videre til oppfølgingsplan-verktøyet.",
        steps: [
          "Starter oppfølgingsplan",
          "Fyller ut stegvis med miniguide",
          "Deler med lege og Nav",
          "Oppgaven fullføres",
        ],
      },
      {
        title: "Ikke behov nå",
        body: "Leder oppgir strukturert årsak.",
        steps: [
          "Velger årsak fra liste",
          "Sender inn vurderingen",
          "Får bekreftelse på at plan kan lages senere",
          "Oppgaven fullføres",
        ],
      },
    ],
  },
  {
    id: "done",
    title: "Oppgave ferdigstilt",
    body: "Uansett valg er oppgaven på Min side arbeidsgiver ferdigstilt. Leder har tatt et bevisst valg, og Nav har informasjon om behov.",
    action: "Veileder kan se vurderingen. Videre bruk og deling må avklares.",
    kind: "outcome",
    tiltakRefs: ["T04"],
  },
  {
    id: "dialogmote",
    timeLabel: "Uke 7+",
    title: "Dialogmøte 1",
    body: "I dag lager mange plan først her. Med tiltakspakke er plan allerede startet eller behovet avklart.",
    kind: "today",
  },
  {
    id: "modia-request",
    title: "Veileder ber om plan i Modia",
    body: "I dag bruker veileder ofte be om plan-knappen rundt aktivitetskravet. Med tiltakspakke blir det unødvendig for arbeidsgivere som allerede har svart.",
    kind: "today",
  },
];

export const openJourneyQuestions = [
  "Eksakt uke for varsel: uke 3, uke 4 eller basert på samlet sykefraværslengde?",
  "Eksternt varsel på e-post eller SMS i tillegg til oppgave på Min side arbeidsgiver?",
  "Hvem ser begrunnelsen ved ikke nå: kun veileder, eller også lege og sykmeldt?",
  "Kandidatkriterier: alle over X uker, eller bare de uten plan?",
  "Fritekst i årsak krever juridisk og personvernmessig avklaring.",
];

export const interventionMapPhases: InterventionMapPhase[] = [
  {
    id: "k1",
    number: 1,
    title: "Varsel og frist",
    behavior:
      "Arbeidsgiver blir oppmerksom i tide og går til riktig person før uke 4.",
    measurement:
      "Varsel vises, leder åpner varsel/person og starter behovsvurdering eller plan før frist.",
    tiltak: [
      {
        id: "T01",
        title: "Varsel før uke 4",
        description:
          "Påminnelse som forklarer hva planen er og hvorfor den bør lages nå.",
        signal: "Åpner varsel; starter vurdering eller plan før frist.",
        guardrail: "Unngå varseltrøtthet og for tidlig press.",
        barriere: "Tidspress og prioritering",
        motivasjon: "Plikt og ytre forventninger",
        dult: "Påminnelse på Min side arbeidsgiver før uke 4 som forklarer hva planen er og hvorfor den bør lages nå.",
        eastFogg: "Timely (før frist), Easy (forklarer hva/hvorfor)",
        forgood: "Respect — påminnelsen skal opplyse, ikke presse.",
        raakort: ["DULT-06"],
        sharedWithSykmeldt:
          "↔ speiler den sykmeldtes tidlige plikt-/prosessinfo",
      },
      {
        id: "T02",
        title: "Frist på riktig person",
        description:
          "Vis frist og relevant planinformasjon på den sykmeldte i Dine sykmeldte.",
        signal: "Åpner riktig person; starter handling.",
        guardrail: "Ikke vis frist hvis saken allerede er avklart.",
        barriere: "Manglende rutiner",
        motivasjon: "Plikt og ytre forventninger",
        dult: "Vis frist og relevant planinfo på den sykmeldte i Dine sykmeldte — en konkret oppgave, ikke passiv info.",
        eastFogg: "Easy (oppgave på riktig person), Salient (tydelig frist)",
        forgood: "Forgiving — ikke dobbeltvarsle hvis saken alt er avklart.",
        raakort: ["DULT-20", "DULT-11"],
      },
    ],
  },
  {
    id: "k2",
    number: 2,
    title: "Behovsvurdering",
    behavior:
      "Arbeidsgiver tar stilling til om plan trengs før planflyten starter.",
    measurement:
      "Fullført behovsvurdering, fordeling lag plan / ikke nå og overgang fra varsel til vurdering.",
    decisionPoint:
      "Veivalg: Lag plan går til planflyt. Plan trengs ikke nå registrerer årsak og avslutter oppgaven.",
    tiltak: [
      {
        id: "T03",
        title: "Personnær vurderingsoppgave",
        description:
          "Gjør passiv sykmeldingsinformasjon til en konkret oppgave på riktig person.",
        signal: "Starter og fullfører behovsvurdering.",
        guardrail: "Ikke mål bare navigasjon som suksess.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Autonomi og eierskap",
        dult: "Gjør passiv sykmeldingsinfo til en konkret behovsvurderingsoppgave på riktig person.",
        eastFogg: "Easy (strukturerte valg), Prompt (utløser handling)",
        forgood: "Honest — mål reell vurdering, ikke bare navigasjon/klikk.",
        raakort: ["DULT-01", "DULT-07"],
        sharedWithSykmeldt: "↔ behovsvurderingen speiler sykmeldts ST04/ST05",
      },
      {
        id: "T04",
        title: "Plan trengs ikke nå",
        description:
          "Arbeidsgiver kan velge riktig utfall når plan ikke er nødvendig.",
        signal: "Andel ikke nå og årsaksfordeling.",
        guardrail: "Ingen default; fritekst krever avklaring og PII-vern.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Autonomi og eierskap",
        dult: "La arbeidsgiver velge «ikke nå» med strukturert årsak — et legitimt utfall, ikke en blindvei.",
        eastFogg: "Easy (årsak fra liste), aktivt valg (ingen default)",
        forgood:
          "Ownership — ingen default; fritekst krever PII-/juridisk avklaring.",
        raakort: ["DULT-15", "DULT-16", "DULT-33"],
      },
    ],
  },
  {
    id: "k3",
    number: 3,
    title: "Stegvis planflyt",
    behavior: "Arbeidsgiver kommer gjennom planen og bruker den videre.",
    measurement: "Planstart, fullføring og justering av aktiv plan.",
    tiltak: [
      {
        id: "T05",
        title: "Miniguide og stegvis plan",
        description:
          "Bryt planarbeidet ned i tydelige steg med enklere språk og fremdrift.",
        signal: "Frafall i planflyt, fullføring og bruk av steg.",
        guardrail: "Ikke overforklar eller gjøre alt til veiviser.",
        barriere: "Relasjon og tillit",
        motivasjon: "Tilhørighet og relasjon",
        dult: "«Revamped Dine sykmeldte» som guider selve samtalen: hvilke spørsmål, hva en plan er, og hvordan dra nytte av den.",
        eastFogg: "Easy (steg + språk), Ability (senker terskel)",
        forgood: "Respect — ikke overforklar eller gjør alt til veiviser.",
        raakort: ["DULT-05", "DULT-24", "DULT-17"],
        sharedWithSykmeldt: "↔ samtaleforberedelsen speiler den sykmeldtes",
      },
      {
        id: "T06",
        title: "Aktiv plan kan justeres",
        description: "Vis at planen ikke er hugget i stein og kan oppdateres.",
        signal: "Åpner aktiv plan og bruker endre/juster.",
        guardrail: "Ikke skap ekstra dokumentasjonsbyrde.",
        barriere: "Manglende rutiner",
        motivasjon: "Autonomi og eierskap",
        dult: "Vis at planen er et levende verktøy med «endre/juster»-knapp — ikke hugget i stein.",
        eastFogg: "Easy (endre direkte), Salient (synlig aktiv plan)",
        forgood: "Forgiving — ikke skap ekstra dokumentasjonsbyrde.",
        raakort: ["DULT-29", "DULT-31", "DULT-35"],
      },
      {
        id: "T07",
        title: "Utkast og fremdrift",
        description:
          "Gjør utkast, gjenstående oppgaver og aktiv plan mer synlig.",
        signal: "Gjenopptar utkast og markerer steg som gjort.",
        guardrail: "Ikke forveksle fremdrift med faktisk kvalitet.",
        barriere: "Tidspress og prioritering",
        motivasjon: "Autonomi og eierskap",
        dult: "Gjør utkast, gjenstående oppgaver og aktiv plan synlig så arbeidet lett kan gjenopptas.",
        eastFogg: "Easy (gjenoppta utkast), Salient (fremdrift)",
        forgood: "Honest — ikke forveksle fremdrift med faktisk kvalitet.",
        raakort: ["DULT-08", "DULT-19"],
      },
    ],
  },
  {
    id: "k4",
    number: 4,
    title: "Evaluering og påminnelse",
    behavior:
      "Arbeidsgiver og sykmeldt avtaler ny samtale og følger opp tilrettelegging.",
    measurement:
      "Evalueringsdato satt, kalender/påminnelse valgt og plan justeres etter evaluering.",
    tiltak: [
      {
        id: "T08",
        title: "Evalueringsdato som ny samtale",
        description:
          "Formuler dato-feltet som avtale om å sjekke om tilrettelegging fungerer.",
        signal: "Evalueringsdato satt og forstått.",
        guardrail: "Ikke bare en administrativ dato.",
        barriere: "Manglende rutiner",
        motivasjon: "Tilhørighet og relasjon",
        dult: "Formuler dato-feltet som en avtale om å sjekke om tilretteleggingen fungerer — en ny samtale, ikke en administrativ dato.",
        eastFogg: "Salient (ny samtale), Timely (avtalt tidspunkt)",
        forgood: "Respect — datoen skal bety noe reelt, ikke pliktløp.",
        raakort: ["DULT-12"],
      },
      {
        id: "T09",
        title: "Kalender og opt-in påminnelse",
        description: "La partene legge datoen i kalender og velge påminnelse.",
        signal: "Kalender lagt til og påminnelse valgt.",
        guardrail: "Ingen skjult default på varsling.",
        barriere: "Tidspress og prioritering",
        motivasjon: "Autonomi og eierskap",
        dult: "La partene legge datoen i kalender og selv velge påminnelse (opt-in).",
        eastFogg: "Easy (ett klikk), Timely (påminnelse)",
        forgood: "Consent — ingen skjult default på varsling.",
        raakort: ["DULT-12", "DULT-22"],
      },
    ],
  },
  {
    id: "k5",
    number: 5,
    title: "Deling med lege og Nav",
    behavior:
      "Arbeidsgiver forstår hvem planen skrives til og hvorfor deling er nyttig.",
    measurement: "Relevant deling og bedre forståelse av mottaker og verdi.",
    tiltak: [
      {
        id: "T10",
        title: "Hvorfor dele med lege og Nav",
        description:
          "Forklar mottaker, formål og nytte av å dele planen tidlig.",
        signal: "Forståelse av deling og deling gjennomført.",
        guardrail: "Ikke gjør deling til press uten kontekst.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Plikt og ytre forventninger",
        dult: "Forklar mottaker, formål og nytte av å dele planen tidlig.",
        eastFogg: "Easy (forklart i kontekst), Salient (synlig nytte)",
        forgood: "Respect — ikke gjør deling til press uten kontekst.",
        raakort: ["DULT-26", "DULT-27"],
      },
      {
        id: "T11",
        title: "Tilrettelegging som virker/ikke virker",
        description:
          "Hjelp arbeidsgiver å skrive relevant om tilrettelegging for videre vurdering.",
        signal: "Relevant felt fylt og kvalitet på beskrivelser.",
        guardrail: "Ikke be om diagnose eller private forhold.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Autonomi og eierskap",
        dult: "Ledetekst som hjelper arbeidsgiver å skrive relevant om hva som virker / ikke virker for videre vurdering.",
        eastFogg: "Easy (ledetekst), Ability (vet hva som er relevant)",
        forgood: "Privacy — ikke be om diagnose eller private forhold.",
        raakort: [],
      },
      {
        id: "T12",
        title: "Lagring og gjenbruk av plan",
        description:
          "Forklar hva Nav lagrer, hva arbeidsgiver bør lagre, og gjenbruk av plan.",
        signal: "Forståelse av lagring og gjenbruk.",
        guardrail: "Ikke oppfordre til ulovlig lagring.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Plikt og ytre forventninger",
        dult: "Forklar hva Nav lagrer, hva arbeidsgiver bør lagre, og gjenbruk av plan på tvers av perioder.",
        eastFogg: "Easy (forklart), Salient (gjenbruk)",
        forgood: "Lawful — ikke oppfordre til ulovlig lagring.",
        raakort: ["DULT-28"],
      },
    ],
  },
];

export const supportTiltak = [
  "T13 - Verdi og plikt i klarspråk",
  "T14 - Samlet innhold og begrepsrydding",
];

export const berikelseUtkastNote =
  "Koblingen til barriere, motivasjon, dult, EAST/Fogg og FORGOOD er et utkast utledet fra atferdskartleggingen og register-docs — et utgangspunkt for kalibrering med teamet, ikke en fasit. Barriere/motivasjon er hentet fra steget tiltaket hører til i reisen; råkort fra dekningskartet.";

export function isJourneyStepVisible(
  step: JourneyStep,
  variant: JourneyVariant,
) {
  if (variant === "package") return true;
  return step.kind === "today" || step.kind === "silence";
}
