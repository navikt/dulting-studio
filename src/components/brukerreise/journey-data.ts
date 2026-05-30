// Datagrunnlag for brukerreisen (nærmeste leder).
// Forankret i det reelle datagrunnlaget:
//   - råkort:        docs/dulting-tiltaksregister.md (DULT-01..35)
//   - bearbeidet:    src/lib/kidult-reference-model.ts (T01..T14)
//   - atferd:        docs/dulting-atferdskartlegging.md (motivasjon/barriere + KPI)
//   - scoping:       docs/dulting-scoping-status.md
// Each phase carries THREE layers — faktisk i dag → lov-idealet → endret flyt —
// plus the real barriere (4 kategorier) and motivasjon (5 drivere) per steg,
// dulting-tiltak coupled by DULT/T-ref, and måletegn from the captured KPI-kort.
// Illustrative, synthetic scenario only — no real persons or cases.
// Persona: leder "Maria" følger opp ansatt "Jonas". Ingen diagnose vises.

export type ChannelKey =
  // arbeidsgiver-sporet
  | "msag"
  | "dsm"
  | "plan"
  | "epost"
  | "nav"
  // sykmeldt-sporet
  | "minside-sykmeldt"
  | "dsf"
  | "sms"
  | "kartlegging";

export type Channel = {
  key: ChannelKey;
  label: string;
  /** CSS custom-property name with the channel accent colour. */
  tint: string;
};

export const channels: Record<ChannelKey, Channel> = {
  msag: { key: "msag", label: "Min side arbeidsgiver", tint: "--ch-msag" },
  dsm: { key: "dsm", label: "Dine sykmeldte", tint: "--ch-dsm" },
  plan: { key: "plan", label: "Oppfølgingsplan", tint: "--ch-plan" },
  epost: { key: "epost", label: "E-post", tint: "--ch-epost" },
  nav: { key: "nav", label: "Nav", tint: "--ch-nav" },
  // sykmeldt-flatene. «Min side for sykmeldte» (vår flate, microfrontend +
  // varsel) og «Ditt sykefravær» (Flex-eid — vi samarbeider, eier den ikke).
  "minside-sykmeldt": {
    key: "minside-sykmeldt",
    label: "Min side for sykmeldte",
    tint: "--ch-dsm",
  },
  dsf: { key: "dsf", label: "Ditt sykefravær", tint: "--ch-msag" },
  sms: { key: "sms", label: "SMS", tint: "--ch-epost" },
  kartlegging: {
    key: "kartlegging",
    label: "Kartleggingsspørsmål",
    tint: "--ch-plan",
  },
};

export type Nudge = {
  channel: ChannelKey;
  title: string;
  body: string;
  cta: string;
};

export type IconKey =
  | "envelope"
  | "bell"
  | "checklist"
  | "chat"
  | "share"
  | "calendar";

export type PhaseScope = "first-track" | "landscape" | "both";

/** The 4 barriere-kategoriene fra Nudgelab-atferdskartleggingen. */
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

export type Phase = {
  n: string; // "01"
  id: string;
  time: string; // "Uke 1–3"
  date: string; // illustrative concrete date
  title: string;
  icon: IconKey;
  scope: PhaseScope;
  actorGoal: string;
  today: {
    /** Faktisk i dag — det som faktisk skjer (ofte ingenting). */
    text: string;
    barrier: string;
    /** Present when today's flow has a stall / dead-zone. */
    silence?: { label: string; detail: string };
  };
  /** Lov-idealet — «slik det burde være» per fagfolkenes 7-stegs-reise. */
  lawIdeal: string;
  /** Hvorfor de stopper opp (fra atferdskartleggingen). */
  barriere: { kategori: BarriereKategori; detalj: string };
  /** Hvorfor de vil — driveren vi spiller på (fra atferdskartleggingen). */
  motivasjon: { driver: MotivasjonsDriver; detalj: string };
  dult: {
    intervention: string;
    nudge: Nudge;
    desiredBehavior: string;
    /** DULT-råkort + T-tiltak som ligger bak. */
    refs: string[];
  };
  /** Eksplisitt avveining (vises der vi vurderer noe med tydelig bakside). */
  consideration?: string;
  /** Måletegn — primære (atferd + opplevelse) er målet; proxy (visninger,
      åpninger, besøk) er dempede bruksindikatorer, så vi ikke styrer mot
      vanity-tall. Hentet fra KPI-kortene i atferdskartleggingen. */
  measurements: { primary: string[]; proxy?: string[] };
  guardrail: string;
  /** To-sidig touchpoint: navngir det tilsvarende steget i det andre sporet. */
  sharedWithAg?: string;
  /** Valgfri produktskjerm-mock (ScreenMock-id). Settes kun der en mock finnes
      — unngår at f.eks. arbeidsgiver-skjermer lekker inn i andre reiser. */
  screenId?: string;
};

/** Felles datakontrakt for en brukerreise (leder eller sykmeldt). */
export type Mission = { track: string; title: string; lead: string };
export type Persona = { leder: string; ansatt: string; note: string };
export type OverordnetMaal = {
  eyebrow: string;
  oppdrag: string;
  kr: string[];
  dialogmote1Note: string;
};
export type Contrast = {
  todayTouchpoints: number;
  dultTouchpoints: number;
  silenceWeeks: number;
};
export type JourneyData = {
  mission: Mission;
  persona: Persona;
  phases: Phase[];
  overordnetMaal: OverordnetMaal;
  contrast: Contrast;
};

export const persona = {
  leder: "Maria",
  ansatt: "Jonas",
  note: "Illustrativt scenario. Syntetisk – ingen reelle personer, saker eller helseopplysninger.",
};

export const mission = {
  track: "Arbeidsgiver-sporet · oppfølging av sykmeldte",
  title: "Brukerreise for nærmeste leder",
  lead: "Hvordan dulting kan få nærmeste leder tidligere i gang med oppfølging og en relevant oppfølgingsplan — fra dagens faktiske flyt, mot flyten med tiltak.",
};

export const phases: Phase[] = [
  {
    n: "01",
    id: "sykmelding",
    time: "Dag 0–3",
    date: "6.–8. januar",
    title: "Sykmelding mottas",
    icon: "envelope",
    scope: "both",
    actorGoal:
      "Maria vil forstå hva som har skjedd, hva hun må gjøre nå, og hvor saken følges opp.",
    today: {
      text: "Sykmeldingen vises i «Dine sykmeldte». Flaten har et oppgavebegrep og oppgaver for andre ting — men verken sykmeldingen eller Dine sykmeldte sier stort om å følge opp akkurat denne personen.",
      barrier:
        "Ingenting peker på oppfølging av Jonas her, så det er lett å tenke «dette tar vi senere».",
    },
    lawIdeal:
      "Slik det burde være: den ansatte kontakter leder, og leder orienterer seg om situasjonen.",
    barriere: {
      kategori: "Manglende rutiner",
      detalj:
        "Ingen oppgave eller utløser peker på oppfølging av denne personen — flaten har oppgaver for andre ting, men ikke for dette. Særlig små virksomheter har ingen egen rutine.",
    },
    motivasjon: {
      driver: "Identitet og rolle",
      detalj:
        "De fleste ledere vil være «en leder som følger opp». Men tidlig kontakt kan misforstås som press eller trakassering hvis rammer og forventninger ikke er satt på forhånd (workshop) — så flaten bør gjøre rollen og rutinen tydelig.",
    },
    dult: {
      intervention:
        "Allerede når sykmeldingen åpnes løftes riktig person og neste steg fram, med en kort tekst om verdien og ansvaret.",
      nudge: {
        channel: "msag",
        title: "Jonas er sykmeldt 50 % i 4 uker",
        body: "Vi anbefaler å ta en samtale med Jonas og starte oppfølgingen tidlig. Se hva du som leder bør gjøre denne uka.",
        cta: "Start oppfølgingen",
      },
      desiredBehavior:
        "Maria åpner riktig person, og forstår hva hun bør gjøre videre.",
      refs: ["DULT-07", "DULT-11", "DULT-02", "DULT-10", "T03", "T13"],
    },
    measurements: {
      primary: [
        "% ledere som vet hva som kommer i sykefraværsoppfølgingen",
        "% ansatte som opplever tidlig kontakt som støtte, ikke press (Lumi)",
      ],
      proxy: ["Åpning av personside etter mottak"],
    },
    guardrail:
      "Ikke gjør alle sykmeldinger til hastesaker. Riktig populasjon og timing, nøytral tone.",
  },
  {
    n: "02",
    id: "tidlig-signal",
    time: "Uke 1–3",
    date: "frem til 27. januar",
    title: "Tidlig varsel før fristen",
    icon: "bell",
    scope: "first-track",
    actorGoal:
      "Maria trenger et konkret varsel om når en oppfølgingsplan bør vurderes.",
    today: {
      text: "Maria får andre Nav-varsler i denne perioden — for eksempel om søknad om sykepenger — men ingenting om oppfølging eller om at en plan snart bør vurderes.",
      barrier:
        "Fristen står i regelverket, men dukker aldri opp som en oppgave i arbeidsdagen.",
      silence: {
        label: "3 uker uten et ord om oppfølging",
        detail:
          "Andre Nav-varsler kommer, men ingenting om oppfølgingsplanen. Ingen oppgave, ingen frist å forholde seg til — her sklir oppfølgingen lettest ut.",
      },
    },
    lawIdeal:
      "Slik det burde være: leder lager oppfølgingsplan sammen med den ansatte så tidlig som mulig, og senest innen 4 uker.",
    barriere: {
      kategori: "Tidspress og prioritering",
      detalj:
        "Oppfølging drukner i alt annet en leder må gjøre — uten en tidsriktig påminnelse blir den nedprioritert til fristen presser på.",
    },
    motivasjon: {
      driver: "Plikt og ytre forventninger",
      detalj:
        "En tydelig, konkret frist gjør plikten håndterbar og lettere å handle på i tide.",
    },
    dult: {
      intervention:
        "Et tidsriktig varsel på Min side arbeidsgiver, koblet til riktig person, før fireukersfristen.",
      nudge: {
        channel: "msag",
        title: "Snart frist for oppfølgingsplan for Jonas",
        body: "Du har frist til 3. februar. Ta stilling nå, så slipper du å vente på at noen spør.",
        cta: "Ta stilling nå",
      },
      desiredBehavior:
        "Maria tar stilling før fireukersfristen — i stedet for å vente til noen spør.",
      refs: ["DULT-06", "DULT-20", "DULT-22", "T01", "T02"],
    },
    consideration:
      "Vi vurderer eksternt varsel (e-post til arbeidsgiver) i tillegg til oppgaven på Min side arbeidsgiver. Det vil trolig dra flere i gang tidlig — men må veies mot varseltrøtthet, og bør testes isolert.",
    measurements: {
      primary: [
        "Stilling tatt eller plan startet før frist",
        "Andel som sender plan uten å vente på beskjed fra veileder",
        "Flere oppfølgingsplaner startet tidligere",
      ],
      proxy: ["Varsel vist / varsel åpnet"],
    },
    guardrail:
      "Unngå varseltrøtthet, for tidlig press og duplikatvarsel når plan allerede finnes.",
  },
  {
    n: "03",
    id: "behovsvurdering",
    screenId: "behovsvurdering",
    time: "Uke 3–4",
    date: "27. januar – 3. februar",
    title: "Trenger vi en oppfølgingsplan?",
    icon: "checklist",
    scope: "first-track",
    actorGoal:
      "Maria må ta stilling: lager vi en plan nå, eller trengs det ikke ennå?",
    today: {
      text: "I dag finnes det ingen måte å svare «nei, ikke nå» på. Maria kan lage en hel oppfølgingsplan, men ikke registrere — med en kort begrunnelse — at en plan ikke trengs ennå.",
      barrier:
        "Når det eneste alternativet er å lage en hel plan, gjør mange ingenting i stedet.",
    },
    lawIdeal:
      "Slik det burde være: leder vurderer behovet (uke 4), eller Nav ber om en plan rundt aktivitetskravet (uke 8).",
    barriere: {
      kategori: "Kunnskapsmangel og uklarhet",
      detalj:
        "Hva innebærer egentlig en oppfølgingsplan, og trengs den her? Uklarheten gjør terskelen for å begynne høy.",
    },
    motivasjon: {
      driver: "Autonomi og eierskap",
      detalj:
        "Å kunne velge riktig handling selv — inkludert «ikke nå» med en grunn — gir lederen eierskap i stedet for en pålagt oppgave. Samtidig (workshop): «for mye valgfrihet» skaper usikkerhet — et konkret, avgrenset valg er nettopp den tydelige rammen ledere etterspør.",
    },
    dult: {
      intervention:
        "En enkel funksjon i «Dine sykmeldte»: ta stilling til om en plan trengs — registrer «ikke nå» med grunn, eller gå videre og lag planen.",
      nudge: {
        channel: "dsm",
        title: "Trenger Jonas en oppfølgingsplan nå?",
        body: "Svar enkelt: lag en plan nå, eller registrer at det ikke trengs ennå — og hvorfor.",
        cta: "Ta stilling",
      },
      desiredBehavior:
        "Maria tar et bevisst valg og går videre til riktig neste steg.",
      refs: ["DULT-01", "DULT-07", "DULT-15", "T03", "T04"],
    },
    consideration:
      "Workshop-innsikt (kandidat, ikke scopet inn): arbeidsgivere mangler ofte info om hva den ansatte får fra Nav — f.eks. unntak fra aktivitetsplikten. Å gi leder relevant kontekst, uten å bryte personvern, kan gjøre vurderingen riktigere.",
    measurements: {
      primary: [
        "Fullført behovsvurdering",
        "Fordeling «lag plan» / «ikke nå»",
        "Andel «ikke nå» med oppgitt grunn",
      ],
    },
    guardrail:
      "«Plan trengs ikke nå» må ikke bli en snarvei bort fra oppfølgingsplikten. Ingen forhåndsvalgt default.",
  },
  {
    n: "04",
    id: "samtale-plan",
    screenId: "samtale-plan",
    time: "Etter vurdering",
    date: "uke 4–5",
    title: "Samtale og planarbeid",
    icon: "chat",
    scope: "landscape",
    actorGoal:
      "Maria og Jonas må snakke om hva som fungerer, hva som er vanskelig, og hva som kan prøves.",
    today: {
      text: "Planarbeidet oppleves som dokumentasjon for Nav, ikke som støtte til en god samtale. Tungt språk og uklare steg gir frafall eller en overfladisk plan.",
      barrier:
        "Lederen er usikker på hvordan en oppfølgingssamtale bør gjøres — hvilke spørsmål, hvordan, sammen eller hver for seg.",
    },
    lawIdeal:
      "Slik det burde være: leder gjennomfører en samtale om tilrettelegging som munner ut i en oppfølgingsplan.",
    barriere: {
      kategori: "Relasjon og tillit",
      detalj:
        "Samtalen kan være vanskelig og personlig. Workshop: ledere mangler ofte relasjonell kompetanse og er gjerne tidligere «kompiser» — og unge ansatte vil ikke alltid snakke med leder. Usikkerheten gjør at samtalen utsettes eller blir tynn.",
    },
    motivasjon: {
      driver: "Tilhørighet og relasjon",
      detalj:
        "Lederen vil at den ansatte skal føle seg ivaretatt — en god samtale styrker relasjonen og gjør tilretteleggingen reell.",
    },
    dult: {
      intervention:
        "Miniguide og stegvis planflyt — en «revamped Dine sykmeldte» som guider selve samtalen: hvilke spørsmål, hva en plan er, og hvordan dra nytte av den.",
      nudge: {
        channel: "plan",
        title: "Klar for samtalen med Jonas?",
        body: "Vi har gjort klar en enkel mal: hva fungerer, hva er vanskelig, hva kan prøves. Husk: man er sykmeldt fra oppgavene — ikke fra arbeidsplassen.",
        cta: "Forbered samtalen",
      },
      desiredBehavior:
        "Maria starter en relevant plan og bruker den i samtalen og tilretteleggingen.",
      refs: ["DULT-05", "DULT-32", "DULT-02", "T05"],
    },
    measurements: {
      primary: [
        "Planstart og planfullføring",
        "% sykmeldte som føler seg ivaretatt av leder ved første samtale",
        "% ledere som vet hva de bør snakke med en sykmeldt om",
      ],
    },
    guardrail:
      "Ikke be om diagnose, private forhold eller unødvendig fritekst. Ikke gjør alt til en veiviser.",
  },
  {
    n: "05",
    id: "deling",
    screenId: "deling",
    time: "Når plan finnes",
    date: "uke 5–6",
    title: "Deling med fastlege og Nav",
    icon: "share",
    scope: "landscape",
    actorGoal:
      "Maria må forstå hva i planen som er nyttig for legen — og trygt å dele.",
    today: {
      text: "De som lager en plan deler den ofte med fastlegen — men få lager den tidlig. Da vet ikke legen hvilken tilrettelegging som prøves ut nå, eller hvilke andre muligheter som finnes på arbeidsplassen.",
      barrier:
        "Nettopp dette trenger legen for å vurdere gradert sykmelding opp mot tilretteleggingen på jobben — og det mangler når planen kommer sent eller aldri.",
    },
    lawIdeal:
      "Slik det burde være: planen deles med fastlegen mellom uke 4 og 6 — ofte etter dialogmøte 1 — og med Nav ved behov.",
    barriere: {
      kategori: "Kunnskapsmangel og uklarhet",
      detalj:
        "Hvem skrives planen til, hvorfor er deling nyttig, og hva er trygt å dele? Uklarheten holder lederen tilbake — og legen mister grunnlaget for å vurdere gradering.",
    },
    motivasjon: {
      driver: "Plikt og ytre forventninger",
      detalj:
        "Å forstå at legen mangler innsikt i arbeidsplassen gjør deling til en meningsfull handling, ikke bare et krav.",
    },
    dult: {
      intervention:
        "Få planen delt tidlig, så legen kjenner oppgavene og tilretteleggingsmulighetene. Forklar mottaker og nytte, hjelp til en trygg beskrivelse — og la den ansatte også kunne dele.",
      nudge: {
        channel: "plan",
        title: "Del planen med fastlegen?",
        body: "Legen kjenner ikke arbeidsplassen til Jonas. Det du beskriver om oppgaver og hva som kan tilrettelegges, hjelper legen å vurdere gradert sykmelding opp mot mulighetene på jobben.",
        cta: "Del trygt",
      },
      desiredBehavior:
        "Planer blir tryggere å dele, og deles tidligere med lege eller Nav.",
      refs: ["DULT-26", "DULT-27", "DULT-30", "T10", "T11", "Målmodell H2"],
    },
    consideration:
      "Dulteteknikk for deling: urgency + forhåndsutfylt valg for fastlegen. Drar trolig opp tidlig deling — men må ikke oppleves som press eller føre til at sensitive opplysninger deles ukritisk.",
    measurements: {
      primary: [
        "Plan delt, og tidspunkt for deling",
        "Tidlig deling før relevant legekontakt (H2, aggregert)",
        "Andel gradert sykmelding der plan ble delt tidlig (aggregert)",
      ],
    },
    guardrail:
      "Deling må ikke oppleves som press eller føre til unødvendig sensitive opplysninger.",
  },
  {
    n: "06",
    id: "evaluering",
    time: "Videre oppfølging",
    date: "uke 12",
    title: "Evaluering og justering",
    icon: "calendar",
    scope: "landscape",
    actorGoal:
      "Maria og Jonas må finne ut om tiltakene fungerer, og justere planen ved behov.",
    today: {
      text: "Planen har en evalueringsdato, men ingenting minner deg systematisk om den — ingen påminnelse, ingen kalenderavtale på Min side arbeidsgiver. Og kommer du tilbake, gir planen lite støtte: du ser ikke hva dere ble enige om sist, og får ingen hjelp til å vurdere tilretteleggingen.",
      barrier:
        "Det eneste tydelige valget er en litt skjult knapp for å lage en helt ny plan — så planen blir et engangsdokument, ikke et levende verktøy for en kontinuerlig oppfølging.",
    },
    lawIdeal:
      "Slik det burde være: leder evaluerer planen med den ansatte, justerer for god opptrapping, og deler oppdatert plan.",
    barriere: {
      kategori: "Manglende rutiner",
      detalj:
        "Ingenting minner om å komme tilbake til datoen — uten påminnelse eller kalenderavtale forsvinner evalueringen i hverdagen.",
    },
    motivasjon: {
      driver: "Autonomi og eierskap",
      detalj:
        "Når planen er deres egen, levende og mulig å endre («ingenting er hugget i stein»), blir det naturlig å vende tilbake til den.",
    },
    dult: {
      intervention:
        "Gjør evalueringsdatoen til en faktisk avtale: kalenderavtale på Min side arbeidsgiver og opt-in-påminnelse om den nye samtalen.",
      nudge: {
        channel: "epost",
        title: "På tide med en ny prat med Jonas?",
        body: "Det er 6 uker siden planen ble laget. Mange tar en ny gjennomgang av tilretteleggingen nå. Vil du sette opp en samtale?",
        cta: "Foreslå tidspunkt",
      },
      desiredBehavior:
        "Maria og Jonas avtaler en ny samtale og oppdaterer planen.",
      refs: [
        "DULT-12",
        "DULT-22",
        "DULT-29",
        "DULT-31",
        "DULT-35",
        "T08",
        "T09",
        "T06",
      ],
    },
    consideration:
      "Større grep (ikke scopet inn nå, men viktig kontekst): gjøre selve planen til et levende dokument — vise forrige samtale, støtte vurdering av hva som er prøvd, og la planen oppdateres i stedet for å måtte lages på nytt. Avgjørende for en kontinuerlig sykefraværsoppfølging.",
    measurements: {
      primary: [
        "Evalueringsdato satt, og kalender/påminnelse valgt",
        "Flere som faktisk evaluerer planen",
      ],
      proxy: ["Plan åpnet og justert senere"],
    },
    guardrail:
      "Ingen skjult default på varsling. Ikke skap ekstra administrasjonsbyrde.",
  },
];

/** Touchpoint counts for the "2 → 6" contrast headline. */
export const contrast = {
  todayTouchpoints: 2,
  dultTouchpoints: 6,
  silenceWeeks: 3,
};

/** AID/IA-målene reisen lader opp til — vises i en «Mål bak reisen»-stripe. */
export const overordnetMaal = {
  eyebrow: "Mål bak reisen",
  oppdrag:
    "Dulting for å øke etterlevelsen av arbeidsgivers tilretteleggingsplikt og den ansattes medvirkningsplikt — med mål om å redusere sykefraværet (AID / IA-avtalen 2025–2028).",
  kr: [
    "Flere oppfølgingsplaner — og tidligere",
    "Flere tar stilling til behov innen uke 4",
    "Plan sendt uten å vente på veileder",
    "Flere gjennomførte dialogmøte 1",
    "Økt gradert sykmelding · kortere sykefravær",
  ],
  dialogmote1Note:
    "Dialogmøte 1 (innen uke 7) ligger i samme horisont. Vi tar ikke dulting-grepet for selve møtet nå — det er en egen satsing senere — men oppfølgingsplanen mater rett inn i det.",
};

/** Samlet brukerreise for nærmeste leder — injiseres i komponentene. */
export const lederJourney: JourneyData = {
  mission,
  persona,
  phases,
  overordnetMaal,
  contrast,
};
