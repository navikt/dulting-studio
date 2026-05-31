export type JourneyScope = "landscape" | "first-track";

export type JourneyStage = {
  id: string;
  timeLabel: string;
  title: string;
  actorGoal: string;
  today: string;
  barrier: string;
  intervention: string;
  desiredBehavior: string;
  measurement: string;
  guardrail: string;
  sources: string[];
  scope: JourneyScope | "both";
};

export type JourneyCluster = {
  id: string;
  title: string;
  status: "Anbefalt første spor" | "Støttelag" | "Senere" | "Avklaring";
  summary: string;
  desiredBehavior: string;
  hypothesis: string;
  measurement: string;
  guardrail: string;
  sources: string[];
};

export type PresentationPrinciple = {
  title: string;
  body: string;
};

export const aidMission = {
  title: "Fra plikt til tidlig handling",
  subtitle:
    "KI-støttet syntese av arbeidsgiver-sporet: hvordan dulting kan få nærmeste leder tidligere i gang med oppfølging, behovsvurdering og relevant oppfølgingsplan.",
  framing:
    "Dette er ikke en automatisk fasit. Det er en kuratert brukerreise basert på Mural-arbeid, tiltaksklynger og målmodellen, laget for å teste hva KI kan bidra med i analyse og formidling.",
  aidGoal:
    "AID-oppdraget handler om å redusere sykefravær ved å styrke arbeidsgivers tilretteleggingsplikt og partenes medvirkningsplikt.",
  firstTrack:
    "Første anbefalte spor er tidsriktig varsel, behovsvurdering og trygg overgang til oppfølgingsplan.",
};

export const presentationPrinciples: PresentationPrinciple[] = [
  {
    title: "Vis hele landskapet",
    body: "Prosjektet trenger en bred brukerreise for alle potensielle tiltak, slik at vi ser overlapp, hull og senere muligheter.",
  },
  {
    title: "Marker første spor tydelig",
    body: "Samtidig må første test være smal nok til å måle: varsel, behovsvurdering, planstart og tidlig deling.",
  },
  {
    title: "Mål nærliggende handlinger først",
    body: "Sykefravær og gradering er viktige hypoteser, men første test bør måles på handlinger, kvalitetstegn og guardrails.",
  },
  {
    title: "Ikke skjul risiko",
    body: "Guardrails må vises ved siden av tiltakene, særlig der løsningen kan presse feil handling eller samle inn helseopplysninger.",
  },
];

export const employerJourneyStages: JourneyStage[] = [
  {
    id: "mottar-sykmelding",
    timeLabel: "Dag 0-3",
    title: "Sykmelding mottas",
    actorGoal:
      "Leder vil forstå hva som har skjedd, hva arbeidsgiver må gjøre nå, og hvor saken følges opp.",
    today:
      "Dine sykmeldte viser periode, grad og informasjon, men gir lite retning for neste handling.",
    barrier:
      "Siden oppleves som informasjon, ikke en oppgave. Ledere med svake rutiner kan vente til noen ber dem om plan.",
    intervention:
      "Gjør riktig person og relevant neste steg tydelig allerede når sykmeldingen åpnes.",
    desiredBehavior:
      "Arbeidsgiver åpner riktig person og forstår at oppfølging starter før fristen for oppfølgingsplan.",
    measurement:
      "Åpning av relevant personside, visning av varsel og overgang til vurdering eller plan.",
    guardrail:
      "Ikke gjør alle sykmeldinger til hastesaker. Varsel må begrenses til relevant populasjon og timing.",
    sources: ["DULT-07", "DULT-11", "Målmodell H1"],
    scope: "both",
  },
  {
    id: "tidlig-signal",
    timeLabel: "Uke 1-3",
    title: "Tidlig varsel før fristen",
    actorGoal:
      "Leder trenger et konkret varsel om når oppfølgingsplan bør vurderes.",
    today:
      "Det kan være stille fra Nav fram til oppfølgingsplan etterspørres senere.",
    barrier:
      "Fristen er kjent i regelverket, men ikke nødvendigvis synlig i lederens arbeidsflate.",
    intervention:
      "Vis oppgave, frist eller påminnelse på Min side arbeidsgiver og på den aktuelle personen.",
    desiredBehavior:
      "Arbeidsgiver går videre til behovsvurdering eller plan før fireukersfristen.",
    measurement:
      "Varsel vist, varsel åpnet, vurdering startet, plan startet før frist.",
    guardrail:
      "Unngå varseltrøtthet, for tidlig press og duplikatvarsel når plan allerede finnes.",
    sources: ["DULT-06", "DULT-20", "Målmodell: Tidsriktig varsel"],
    scope: "first-track",
  },
  {
    id: "behovsvurdering",
    timeLabel: "Uke 3-4",
    title: "Behovsvurdering på riktig person",
    actorGoal:
      "Leder må ta stilling: trenger vi oppfølgingsplan nå, må vi snakke først, eller er plan allerede i gang?",
    today:
      "Arbeidsgiver kan lese informasjon, men blir ikke nødvendigvis ledet gjennom en trygg vurdering.",
    barrier:
      "Ja/nei uten struktur kan bli feil. Fritekst kan skape PII- og helsedatarisiko.",
    intervention:
      "Kort vurdering med strukturerte valg og ingen forhåndsvalgt default.",
    desiredBehavior:
      "Arbeidsgiver tar et bevisst valg og går videre til riktig neste steg.",
    measurement:
      "Vurdering startet/fullført, valgt utfall, overgang til plan, andel 'plan trengs ikke nå'.",
    guardrail:
      "'Plan trengs ikke nå' må ikke bli en snarvei bort fra oppfølgingsplikten.",
    sources: ["DULT-01", "DULT-07", "DULT-15", "Analysemodell §6"],
    scope: "first-track",
  },
  {
    id: "samtale-og-plan",
    timeLabel: "Etter vurdering",
    title: "Samtale og planarbeid",
    actorGoal:
      "Leder og ansatt må snakke om hva som fungerer, hva som er vanskelig, og hva som kan prøves.",
    today:
      "Planarbeid kan oppleves som dokumentasjon for Nav, ikke som støtte til samtale og tilrettelegging.",
    barrier:
      "For mye tekst, juridisk språk og uklare steg kan gi frafall eller overfladisk plan.",
    intervention:
      "Miniguide, stegvis planflyt og tydelig tekst om verdi, plikt og neste steg.",
    desiredBehavior:
      "Arbeidsgiver starter relevant plan og bruker den til samtale og tilrettelegging.",
    measurement:
      "Planstart, planfullføring, frafall i planflyt og survey om forståelse.",
    guardrail:
      "Ikke be om diagnose, private forhold eller unødvendig fritekst.",
    sources: ["DULT-02", "DULT-05", "DULT-10", "DULT-24"],
    scope: "landscape",
  },
  {
    id: "deling",
    timeLabel: "Når plan finnes",
    title: "Deling med fastlege og Nav",
    actorGoal:
      "Leder må forstå hvorfor planen kan være nyttig for lege/Nav, og hva som bør deles.",
    today:
      "Deling kan skje sent eller ikke i det hele tatt, selv når planen kunne gitt bedre grunnlag for vurdering.",
    barrier:
      "Arbeidsgiver kan være usikker på mottaker, formål og hva som er trygt å skrive.",
    intervention:
      "Forklar mottaker, nytte og trygg beskrivelse av arbeidsoppgaver og tilrettelegging.",
    desiredBehavior:
      "Flere relevante planer deles tidligere med lege eller Nav.",
    measurement:
      "Plan delt, tidspunkt for deling og eventuell kobling til relevant legekontakt på aggregert nivå.",
    guardrail:
      "Deling må ikke oppleves som press eller føre til unødvendig sensitive opplysninger.",
    sources: ["Målmodell H2", "DULT-05", "Analysemodell §3"],
    scope: "landscape",
  },
  {
    id: "evaluering",
    timeLabel: "Videre oppfølging",
    title: "Evaluering og justering",
    actorGoal:
      "Leder og ansatt må finne ut om tiltakene fungerer, og justere planen ved behov.",
    today:
      "Oppfølging kan stoppe etter planstart hvis ingen minner partene på ny samtale.",
    barrier:
      "Planen kan bli et dokument som fylles ut én gang, ikke et verktøy for videre oppfølging.",
    intervention:
      "Evalueringsdato, kalenderavtale eller opt-in-påminnelse knyttet til ny samtale.",
    desiredBehavior:
      "Arbeidsgiver og sykmeldt avtaler ny samtale og oppdaterer planen.",
    measurement:
      "Evalueringsdato satt, påminnelse valgt, plan åpnet og justert senere.",
    guardrail:
      "Ingen skjult default på varsling. Ikke skap ekstra administrasjonsbyrde.",
    sources: ["DULT-08", "DULT-12", "DULT-22"],
    scope: "landscape",
  },
];

export const employerClusters: JourneyCluster[] = [
  {
    id: "timely-signal",
    title: "Tidsriktig varsel",
    status: "Anbefalt første spor",
    summary:
      "Gjør arbeidsgiver oppmerksom før oppfølgingsplan bør vurderes, med tydelig frist og riktig kontekst.",
    desiredBehavior:
      "Arbeidsgiver går til riktig person og starter vurdering eller plan før fristen.",
    hypothesis:
      "Hvis varselet kommer tidsriktig og peker til riktig person, kan flere komme tidligere i gang med oppfølging.",
    measurement:
      "Varsel vist, åpnet, vurdering startet, plan startet før frist.",
    guardrail:
      "Varselet må ikke bli støy, kontrollopplevelse eller varsel til irrelevante sykefravær.",
    sources: ["DULT-06", "DULT-20"],
  },
  {
    id: "need-assessment",
    title: "Behovsvurdering i Dine sykmeldte",
    status: "Anbefalt første spor",
    summary:
      "Gjør passiv informasjon til en konkret vurdering med trygg overgang til plan eller annet neste steg.",
    desiredBehavior:
      "Arbeidsgiver tar stilling til behovet og velger riktig handling.",
    hypothesis:
      "Hvis vurderingen er kort, konkret og trygg, kan flere relevante planer starte tidligere.",
    measurement:
      "Fullført vurdering, valgt utfall, overgang til plan og tidlig deling.",
    guardrail:
      "Ingen default på 'plan trengs ikke nå'. Ingen fritekst uten avklaring.",
    sources: ["DULT-01", "DULT-07", "DULT-15", "DULT-16"],
  },
  {
    id: "support-text",
    title: "Støttende tekst og forståelse",
    status: "Støttelag",
    summary:
      "Forklarer verdi, ansvar og neste steg uten å gjøre teksten moraliserende eller for lang.",
    desiredBehavior:
      "Arbeidsgiver forstår hva som forventes og hvorfor oppfølging er nyttig.",
    hypothesis:
      "Klarspråk kan redusere friksjon og øke kvaliteten på valget i vurderingen.",
    measurement:
      "Survey om forståelse, mindre frafall og bedre overgang til riktig neste steg.",
    guardrail:
      "Teksten må ikke presse fram feil handling eller skjule valgmuligheter.",
    sources: ["DULT-02", "DULT-10", "DULT-13"],
  },
  {
    id: "guided-plan",
    title: "Stegvis hjelp i planflyt",
    status: "Senere",
    summary:
      "Støtter arbeidsgiver etter at planarbeidet er startet, med miniguide, fremdrift og enklere språk.",
    desiredBehavior:
      "Arbeidsgiver fullfører en relevant plan og bruker den i dialog med den ansatte.",
    hypothesis:
      "Hvis planen oppleves som en samtalestøtte, kan kvaliteten på tilretteleggingen øke.",
    measurement: "Planfullføring, frafall, redigering og survey om nytte.",
    guardrail: "Ikke gjør alt til veiviser eller dokumentasjonsbyrde.",
    sources: ["DULT-05", "DULT-08", "DULT-19", "DULT-24"],
  },
  {
    id: "evaluation",
    title: "Evaluering og påminnelser",
    status: "Senere",
    summary:
      "Hjelper partene å følge opp tiltak og justere planen etter første samtale.",
    desiredBehavior:
      "Arbeidsgiver og sykmeldt avtaler ny samtale og evaluerer tilrettelegging.",
    hypothesis:
      "Hvis oppfølgingen får et konkret neste tidspunkt, blir planen mer levende.",
    measurement:
      "Evalueringsdato, kalender/påminnelse valgt og senere planjustering.",
    guardrail: "Opt-in på påminnelser. Ikke skjult default.",
    sources: ["DULT-12", "DULT-22"],
  },
];
