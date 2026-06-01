// Bearbeidet referansemodell for sykmeldt-sporet — motstykket til
// kidult-reference-model.ts (arbeidsgiver). Bygd fra det bearbeidede registeret
// docs/dulting-tiltaksregister-sykmeldt-bearbeidet.md (råkort SYK-* → ST-tiltak),
// koblet til barriere/motivasjon/EAST-Fogg/FORGOOD/måletegn/guardrail + delt-med-AG.
// Illustrativt, syntetisk — ingen reelle personer, saker eller helseopplysninger.

/** De 4 barriere-kategoriene fra Nudgelab-atferdskartleggingen. */
export type BarriereKategori =
  | "Tidspress og prioritering"
  | "Manglende rutiner"
  | "Relasjon og tillit"
  | "Kunnskapsmangel og uklarhet";

/** De 5 motivasjonsdriverne fra Nudgelab-atferdskartleggingen. */
export type MotivasjonsDriver =
  | "Autonomi og eierskap"
  | "Identitet og rolle"
  | "Tilhørighet og relasjon"
  | "Plikt og ytre forventninger"
  | "Ytre insentiver";

export type SykmeldtTiltak = {
  id: string; // "ST01"
  title: string;
  /** Konsoliderte råkort (SYK-*) bak tiltaket — sporbarhet. */
  raakort: string[];
  /** Ønsket atferd hos den sykmeldte. */
  onsketAtferd: string;
  barriere: BarriereKategori;
  motivasjon: MotivasjonsDriver;
  /** Selve dultet/intervensjonen. */
  dult: string;
  /** Kvalitative EAST/Fogg-flagg (ikke skår). */
  eastFogg: string;
  /** Etisk flagg (FORGOOD) — punktet som krever mest varsomhet. */
  forgood: string;
  maaletegn: string;
  guardrail: string;
  /** ✔ = delt touchpoint med arbeidsgiver-reisen. */
  sharedWithAg?: string;
};

export type SykmeldtPhase = {
  id: string; // "s1"
  number: number;
  title: string;
  /** Klyngemål — ønsket atferd på klyngenivå. */
  goal: string;
  /** Klynge-måletegn. */
  measurement: string;
  /** Hvilken AG-klynge/-steg dette speiler. */
  mirrors?: string;
  tiltak: SykmeldtTiltak[];
};

export const sykmeldtMission = {
  track: "Sykmeldt-sporet · medvirkning i egen oppfølging",
  title: "Tiltakskart for den sykmeldte",
  lead: "Sykmeldt-sporets bearbeidede tiltak: råkort fra workshop koblet til barriere, motivasjon, måletegn og stoppunkter — sett fra den sykmeldte, og merket der touchpointet deles med arbeidsgiver.",
};

export const sykmeldtMapPhases: SykmeldtPhase[] = [
  {
    id: "s1",
    number: 1,
    title: "Tidlig info, plikt og forståelse",
    goal: "Den sykmeldte forstår hva som skjer, egne plikter og verdien av tidlig dialog — fra dag 1, i lett språk.",
    measurement:
      "Selvrapportert forståelse av egne plikter (Lumi), besøk på info-/sykefraværsflate, og andel som tar tidlig kontakt med leder.",
    mirrors:
      "Sykmeldt-spesifikk inngang (AG-motstykket er klarspråk-støttelaget).",
    tiltak: [
      {
        id: "ST01",
        title: "Plikt- og prosessinfo fra dag 1",
        raakort: ["SYK-01", "SYK-03", "SYK-05"],
        onsketAtferd:
          "Kjenner medvirknings-/aktivitetsplikten og vet hva som skjer videre — fra dag 1, ikke først ved evaluering.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Plikt og ytre forventninger",
        dult: "Microfrontend på «Ditt sykefravær» (pull, ingen ekstern push): lett og hjelp-først dag 1 — hva skjer nå, hva du kan, neste steg — med et tydeligere plikt-/prosess-lag når fraværet strekker seg mot uke 4.",
        eastFogg: "Easy (lett språk), Timely / Prompt (dag 1)",
        forgood: "Respect — plikt-info skal opplyse, ikke true.",
        maaletegn:
          "Selvrapportert forståelse av egne plikter (Lumi); besøk på info-flate etter sykmelding.",
        guardrail:
          "Ikke overvelde dag 1; ikke bruk plikt som pisk. SYK-R2: start på «Ditt sykefravær», ikke i selve sykmeldingen.",
      },
      {
        id: "ST02",
        title: "Oppfordre tidlig kontakt + vis gevinsten",
        raakort: ["SYK-02", "SYK-06"],
        onsketAtferd:
          "Tar (eller er åpen for) tidlig kontakt med nærmeste leder.",
        barriere: "Manglende rutiner",
        motivasjon: "Identitet og rolle",
        dult: "Dult i «Ditt sykefravær» om å kontakte leder, koblet til «god dialog → raskere tilbake i jobb og større sjanse til å beholde jobben».",
        eastFogg: "Attractive (gevinst), Timely",
        forgood: "Openness — gevinst-budskapet må være ærlig, ikke skremme.",
        maaletegn:
          "Selvrapportert tidlig kontakt (Lumi); andel som opplever tidlig kontakt som støtte, ikke press.",
        guardrail:
          "Ikke gjør kontakt til et krav; sykmeldt kan ha gode grunner til å vente.",
        sharedWithAg: "AG steg 01 (leder venter ofte på kontakt)",
      },
      {
        id: "ST03",
        title: "Vis hva leder skal gjøre (symmetri)",
        raakort: ["SYK-04", "SYK-R1"],
        onsketAtferd:
          "Forstår leders ansvar, så hele prosessen blir forutsigbar.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Tilhørighet og relasjon",
        dult: "Vis kort hva arbeidsgiver har fått beskjed om / skal gjøre (speiler AG-varselet), så bildet henger sammen for begge parter.",
        eastFogg: "Social (felles forventning), Easy",
        forgood: "Fairness — begge parter får samme bilde.",
        maaletegn:
          "Selvrapportert forståelse av prosessen og av leders rolle (Lumi).",
        guardrail:
          "Ikke lov mer om arbeidsgiver enn det vi vet skjer; ikke skap forventninger leder ikke kan innfri.",
        sharedWithAg: "AG steg 01 (symmetri)",
      },
    ],
  },
  {
    id: "s2",
    number: 2,
    title: "Tidsriktig varsel og egen behovsvurdering",
    goal: "Den sykmeldte tar stilling til behovet for plan rundt uke 4 — på eget initiativ, ikke bare ved å vente på leder.",
    measurement:
      "Antall egne behovsvurderinger innen uke 4, andel «ja» som utløser AG-varsel, og respons på SMS/varsel.",
    mirrors: "AG k1 (varsel/frist) + k2 (behovsvurdering).",
    tiltak: [
      {
        id: "ST04",
        title: "Tidsriktig varsel ~uke 4",
        raakort: ["SYK-07", "SYK-08"],
        onsketAtferd:
          "Blir minnet på, og vurderer behovet for en oppfølgingsplan før/rundt uke 4.",
        barriere: "Tidspress og prioritering",
        motivasjon: "Plikt og ytre forventninger",
        dult: "SMS/varsel ~uke 4 ved manglende plan, evt. pop-up i kvitteringen etter innsendt sykmelding.",
        eastFogg: "Timely, Prompt",
        forgood: "Respect — én tidsriktig påminnelse, ikke mas.",
        maaletegn:
          "Varsel vist/åpnet; andel som vurderer behov innen uke 4; besøk på flate etter SMS.",
        guardrail:
          "Unngå varseltrøtthet og duplikat når plan/vurdering finnes; ikke for tidlig press.",
        sharedWithAg: "AG steg 02 (tidlig varsel)",
      },
      {
        id: "ST05",
        title: "Egen behovsvurdering, delbar; ja → AG-varsel",
        raakort: ["SYK-08", "SYK-09", "SYK-R3", "SYK-R4"],
        onsketAtferd:
          "Gjør en egen vurdering av behovet, kan dele den med Nav, og «ja» utløser varsel til arbeidsgiver.",
        barriere: "Manglende rutiner",
        motivasjon: "Autonomi og eierskap",
        dult: "Oppgave i «Ditt sykefravær»: sykmeldt ber om plan via en kort vurdering (delbar med Nav/lege); «ja» → synlig forespørsel + varsel til leder. AG eier og bestemmer planen, men forespørselen kan ikke ignoreres stille.",
        eastFogg: "Easy, Social (felles signal), Prompt",
        forgood:
          "Openness — tydelig hvem som ser vurderingen og hva «ja» utløser.",
        maaletegn:
          "Antall egne vurderinger; andel «ja» som utløser AG-varsel; andel delt med Nav.",
        guardrail:
          "Tydelig samtykke/åpenhet om deling; ingen forhåndsvalgt default; «ikke nå» må være et reelt valg. Uenighet (sykmeldt ja / AG nei): forespørselen forblir synlig, AGs «nei» bør kreve registrert grunn.",
        sharedWithAg: "AG steg 03 (behovsvurdering; mulig felles skjema)",
      },
      {
        id: "ST06",
        title: "Kartleggingsspørsmål som ny anledning + skille fra plan",
        raakort: ["SYK-10", "SYK-19"],
        onsketAtferd:
          "Bruker kartleggingsspørsmålene (uke ~7) til å vurdere behov på nytt — og forstår at de ikke er en oppfølgingsplan.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Autonomi og eierskap",
        dult: "Bruk kartleggingen som ny anledning til behovsvurdering, med tydelig forklaring av forskjellen kartlegging vs. oppfølgingsplan.",
        eastFogg: "Timely, Easy",
        forgood: "Openness — vær åpen om hva kartleggingen er og ikke er.",
        maaletegn:
          "Andel som vurderer behov via kartlegging; selvrapportert forståelse av forskjellen (Lumi).",
        guardrail:
          "Sterkt geografi-avhengig (pilot Troms og Finnmark) — kan ikke forutsettes; må ikke bli «enda et skjema».",
      },
    ],
  },
  {
    id: "s3",
    number: 3,
    title: "Forstå, forberede og medvirke i planen",
    goal: "Den sykmeldte forstår hva en plan er, møter forberedt til samtalen, og ser sitt eget medvirkningsrom.",
    measurement:
      "Visninger av forberedelsesskjema før plan, % som føler seg ivaretatt ved første samtale (Lumi), og andel planer med sykmeldt-medvirkning.",
    mirrors: "AG k3 (stegvis planflyt).",
    tiltak: [
      {
        id: "ST07",
        title: "Forstå hva en plan er + gevinsten",
        raakort: ["SYK-11"],
        onsketAtferd:
          "Forstår hva en oppfølgingsplan er og hvorfor den er nyttig — på lavere terskel enn i dag.",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Autonomi og eierskap",
        dult: "Enkel guide/verktøy om hva planen er og gevinsten (klarspråk-miniguiden fra planflyten hører hjemme her) — enklere enn dagens.",
        eastFogg: "Easy, Attractive",
        forgood: "Openness — ærlig om hva planen brukes til og av hvem.",
        maaletegn:
          "Bruk av guide før plan; selvrapportert forståelse av plan-gevinst (Lumi).",
        guardrail:
          "Ikke overforklar eller gjør alt til en veiviser; ikke lov mer enn planen leverer.",
      },
      {
        id: "ST08",
        title: "Forberedelsesskjema til samtalen",
        raakort: ["SYK-12", "SYK-14"],
        onsketAtferd: "Møter forberedt til samtalen med leder og bidrar reelt.",
        barriere: "Relasjon og tillit",
        motivasjon: "Autonomi og eierskap",
        dult: "Forberedelsesskjema «hva bør du tenke på når du skal lage en plan med lederen din» + samtaleguide fra idébanken.",
        eastFogg: "Easy, Social, Timely",
        forgood: "Respect — frivillig hjelp, ikke et nytt krav.",
        maaletegn:
          "Visninger av forberedelsesskjema før plan; % som føler seg ivaretatt ved første samtale (Lumi).",
        guardrail:
          "Ikke be om diagnose eller private forhold; en hjelp, ikke obligatorisk dokumentasjon.",
        sharedWithAg: "AG steg 04 (samtale og planarbeid)",
      },
      {
        id: "ST09",
        title: "«Sykmeldt fra oppgavene» — medvirkningsrommet",
        raakort: ["SYK-12", "SYK-13"],
        onsketAtferd:
          "Ser konkrete muligheter for å bidra med andre oppgaver mens hen er sykmeldt (medvirkning).",
        barriere: "Kunnskapsmangel og uklarhet",
        motivasjon: "Identitet og rolle",
        dult: "Gjennomgående framing «sykmeldt fra oppgavene, ikke arbeidsplassen» + konkrete eksempler på hva man kan gjøre.",
        eastFogg: "Attractive (åpner mulighet), Social (norm)",
        forgood:
          "Respect + Dignity — aldri presse en syk person til aktivitet hen ikke er i stand til.",
        maaletegn:
          "Selvrapportert opplevelse av mulighetsrom (Lumi); (aggregert) gradert sykmelding der tilrettelegging ble prøvd.",
        guardrail:
          "Må aldri bli «du burde jobbe mer»; helsen styrer, ikke flaten.",
        sharedWithAg: "AG steg 04 + rød tråd / støttelag",
      },
    ],
  },
  {
    id: "s4",
    number: 4,
    title: "Medvirkning og deling",
    goal: "Den sykmeldte er en aktiv part i planen — ikke en passiv mottaker — og kan dele den selv.",
    measurement:
      "Andel planer med sykmeldt-medvirkning, deling med lege/Nav, og tidlig deling (aggregert).",
    mirrors: "AG k5 (deling).",
    tiltak: [
      {
        id: "ST10",
        title: "Sykmeldt medvirker i og deler planen",
        raakort: ["atferdskort", "SYK-R3"],
        onsketAtferd:
          "Skriver inn/kommenterer i planen, kan be arbeidsgiver lage en plan, og kan dele planen med lege/Nav selv.",
        barriere: "Manglende rutiner",
        motivasjon: "Autonomi og eierskap",
        dult: "La sykmeldt skrive i / kommentere planen; «be AG lage plan» → AG-oppgave; egen delingsknapp mot lege/Nav.",
        eastFogg: "Easy, Social",
        forgood:
          "Openness + Respect — tydelig hvem som ser hva; deling skal ikke føles som press.",
        maaletegn:
          "Andel planer med sykmeldt-medvirkning; deling med lege/Nav opp; tidlig deling (aggregert).",
        guardrail:
          "Unngå dobbel-varsling når plan er delt; sensitive opplysninger ikke deles ukritisk; ikke press.",
        sharedWithAg: "AG steg 04–05 («be om plan» trigger AG-oppgave)",
      },
    ],
  },
  {
    id: "s5",
    number: 5,
    title: "Evaluering og kontinuitet",
    goal: "Planen blir et levende verktøy — evaluert og justert sammen — ikke et engangsdokument.",
    measurement:
      "Andel som faktisk evaluerer, plan åpnet/justert senere, og rating av tiltak.",
    mirrors: "AG k4 (evaluering og påminnelse).",
    tiltak: [
      {
        id: "ST11",
        title: "Evalueringsdato + påminnelse + mal",
        raakort: ["SYK-15", "SYK-16"],
        onsketAtferd:
          "Setter en realistisk evalueringsdato og forbereder seg til evalueringen.",
        barriere: "Manglende rutiner",
        motivasjon: "Plikt og ytre forventninger",
        dult: "Default evalueringsdato (4 uker / siste sykmeldingsdag) + påminnelse på innloggede sider med en mal for hva man bør ta stilling til.",
        eastFogg: "Easy (default), Timely / Prompt (påminnelse)",
        forgood:
          "Respect — opt-in påminnelse, ingen skjult default på varsling.",
        maaletegn:
          "Evalueringsdato satt; påminnelse valgt; andel som forbereder seg.",
        guardrail:
          "Ingen skjult default på selve varslingen; ikke skap ekstra administrasjonsbyrde.",
        sharedWithAg: "AG steg 06 (evaluering)",
      },
      {
        id: "ST12",
        title: "Evalueringsside + flere planer",
        raakort: ["SYK-17", "SYK-18"],
        onsketAtferd:
          "Markerer hva som virker / er utfordrende, og lager/justerer ny plan ved lengre fravær.",
        barriere: "Manglende rutiner",
        motivasjon: "Autonomi og eierskap",
        dult: "Evalueringsside der sykmeldt markerer hvilke tiltak som virker / er utfordrende; oppfordre til flere planer ved lengre fravær.",
        eastFogg: "Easy, Attractive",
        forgood:
          "Dignity — unngå dømmende språk; ikke bruk ordet «funket» om noe som ikke gikk.",
        maaletegn:
          "Rating av tiltak; plan åpnet/justert senere; antall planer i lange forløp.",
        guardrail:
          "Ikke gjør flere planer til et krav; unngå skyld-språk når tiltak ikke virket.",
        sharedWithAg: "AG steg 06",
      },
    ],
  },
];

export const sykmeldtSupport = [
  "Framing «sykmeldt fra oppgavene, ikke arbeidsplassen» — rød tråd i alle steg",
  "Plikt i klarspråk — informere uten å presse fram feil handling",
  "Kartleggingsspørsmål-avklaring — skill alltid kartlegging fra oppfølgingsplan",
  "SYK-R2-guardrail — endringer i selve sykmeldingen eies av annet team; bruk «Ditt sykefravær» / SMS / bjella",
];

export const sykmeldtOpenQuestions = [
  "Felles vurderingsskjema? ST05 (sykmeldt) og AG-16/24 peker mot samme flate — én delt behovsvurdering sett fra to sider?",
  "Hvem ser sykmeldtes vurdering: kun Nav, eller også lege/arbeidsgiver — og når utløses AG-varselet (på «ja», eller alltid)?",
  "Kartleggingsspørsmål: nasjonal utrulling endrer alt — hvor mye skal vi designe for en pilot-flate?",
  "Tone i plikt-språket: hvor hardt kan vi snakke om medvirknings-/aktivitetsplikt før det tipper fra «informere» til «presse»?",
  "Teknisk medvirkning (ST10): hva er faktisk mulig på kort sikt gitt at sykmeldt i dag ikke skriver i planen?",
];

export const sykmeldtTotalTiltak = sykmeldtMapPhases.reduce(
  (sum, phase) => sum + phase.tiltak.length,
  0,
);
