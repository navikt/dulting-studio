// Datagrunnlag for brukerreisen sett fra DEN SYKMELDTE — motstykket til
// journey-data.ts (nærmeste leder). Speiler AG-reisens struktur (6 steg,
// tre-lags faktisk/lov-ideal/endret + why-laget), men sett fra Jonas sin side.
// Forankret i det bearbeidede registeret:
//   docs/dulting-tiltaksregister-sykmeldt-bearbeidet.md (ST01..ST12 ← SYK-*)
//   src/lib/sykmeldt-reference-model.ts
// Tone: informere, aldri presse. Rød tråd: «sykmeldt fra oppgavene, ikke
// arbeidsplassen». Delte touchpoints merkes med sharedWithAg (peker på AG-steget).
// Illustrativt, syntetisk — samme person (Jonas) som AG-reisen følger via Maria.

import type {
  Contrast,
  JourneyData,
  Mission,
  OverordnetMaal,
  Persona,
  Phase,
} from "./journey-data";

const persona: Persona = {
  leder: "Maria",
  ansatt: "Jonas",
  note: "Illustrativt scenario. Syntetisk – ingen reelle personer, saker eller helseopplysninger.",
};

const mission: Mission = {
  track: "Sykmeldt-sporet · medvirkning i egen oppfølging",
  title: "Brukerreise for den sykmeldte",
  lead: "Hvordan dulting kan gjøre den sykmeldte til en informert, medvirkende part i egen oppfølging — fra dagens passive flyt, mot en der man forstår pliktene sine, vurderer behov tidlig og medvirker i planen.",
};

const contrast: Contrast = {
  todayTouchpoints: 1,
  dultTouchpoints: 6,
  silenceWeeks: 3,
};

const phases: Phase[] = [
  {
    n: "01",
    id: "sykmelding-sendt",
    time: "Dag 0–3",
    date: "6.–8. januar",
    title: "Sykmelding sendt — hva skjer nå?",
    icon: "envelope",
    scope: "both",
    actorGoal:
      "Jonas vil forstå hva som har skjedd, hva som forventes av ham, og hva som skjer videre.",
    today: {
      text: "Etter innsendt sykmelding møter Jonas en stort sett passiv kvitterings-/informasjonsside (gradering, varighet). Ingenting om plikter, hva som skjer videre, eller om å ta kontakt med leder.",
      barrier:
        "Ingenting forklarer rollen hans i oppfølgingen, så det er lett å tenke at «Nav og arbeidsgiver ordner dette».",
    },
    lawIdeal:
      "Slik det burde være: den ansatte kontakter leder og medvirker i egen oppfølging.",
    barriere: {
      kategori: "Kunnskapsmangel og uklarhet",
      detalj:
        "Jonas vet ikke hva som forventes, hva en oppfølgingsplan er, eller hva leder skal gjøre. Plikt-språk må være lett og opplysende, ikke truende.",
    },
    motivasjon: {
      driver: "Plikt og ytre forventninger",
      detalj:
        "De fleste vil «gjøre det rette» når det er tydelig og lavterskel — men plikten må det informeres om, ikke brukes som press.",
    },
    dult: {
      intervention:
        "Allerede på «Min side for sykmeldte» / «Ditt sykefravær» løftes lett, motiverende info fram: hva skjer nå, dine plikter uten tunge ord, og en oppfordring om tidlig kontakt med leder — med hvorfor det lønner seg.",
      nudge: {
        channel: "minside-sykmeldt",
        title: "Du er sykmeldt — her er hva som skjer videre",
        body: "En kort prat med lederen din tidlig gjør resten enklere. Du er sykmeldt fra oppgavene dine, ikke fra arbeidsplassen.",
        cta: "Se hva du kan forvente",
      },
      desiredBehavior:
        "Jonas forstår prosessen og tar (eller er åpen for) tidlig kontakt.",
      refs: ["ST01", "ST02", "ST03", "SYK-02", "SYK-05", "SYK-13"],
    },
    consideration:
      "Å legge dette i selve sykmeldingen eies av et annet team (Symfoni). Start på «Min side for sykmeldte» / «Ditt sykefravær» (Flex) via microfrontend — flater vi samarbeider om, men ikke eier alene.",
    measurements: {
      primary: [
        "% sykmeldte som forstår egne plikter (Lumi)",
        "% som tar tidlig kontakt med leder",
      ],
      proxy: ["Besøk på info-/sykefraværsflate etter sykmelding"],
    },
    guardrail:
      "Ikke overvelde dag 1; plikt skal opplyse, ikke true. Bygg inn i eksisterende flater.",
    sharedWithAg: "AG steg 01",
  },
  {
    n: "02",
    id: "tidlig-signal",
    time: "Uke 1–4",
    date: "frem til 3. februar",
    title: "Tidlig varsel før fristen",
    icon: "bell",
    scope: "both",
    underAvklaring:
      "Varsel til sykmeldt henger på behovsvurderingen — under avklaring",
    actorGoal:
      "Jonas trenger et tidsriktig varsel om at en oppfølgingsplan snart bør vurderes.",
    today: {
      text: "Jonas får kanskje generelle Nav-varsler (for eksempel om sykepenger), men ingenting om oppfølging eller om at en plan snart bør vurderes.",
      barrier:
        "Plikten står i regelverket, men dukker aldri opp som noe konkret i hverdagen.",
      silence: {
        label: "3 uker uten et ord om oppfølging",
        detail:
          "Andre Nav-varsler kan komme, men ingenting om oppfølgingsplanen eller egen medvirkning. Her sklir det lettest ut — for begge parter.",
      },
    },
    lawIdeal: "Slik det burde være: behov for plan vurderes rundt uke 4.",
    barriere: {
      kategori: "Tidspress og prioritering",
      detalj:
        "Uten en konkret, tidsriktig utløser nedprioriteres oppfølging — særlig når man er syk og har nok med seg selv.",
    },
    motivasjon: {
      driver: "Plikt og ytre forventninger",
      detalj:
        "En tydelig, tidsriktig anledning gjør plikten håndterbar og lettere å handle på i tide.",
    },
    dult: {
      intervention:
        "En tidsriktig oppgave på «Min side for sykmeldte» (med SMS-varsling ved siden av) rundt uke 4, som minner om at en plan bør vurderes.",
      nudge: {
        channel: "minside-sykmeldt",
        via: "sms",
        title: "Snart fire uker — vurder en oppfølgingsplan",
        body: "Det nærmer seg fire uker. Vil du vurdere om du trenger en oppfølgingsplan med lederen din?",
        cta: "Vurder behovet",
      },
      desiredBehavior:
        "Jonas blir minnet på, og er klar til å ta stilling før fristen.",
      refs: ["ST04", "SYK-07", "SYK-08"],
    },
    consideration:
      "Bare leder-varselet er spikret. Å varsle den sykmeldte — og be dem vurdere behovet selv — henger på det toveis grepet i steg 3 (ST05): dropper vi sykmeldt-behovsvurderingen, har dette varselet lite å varsle om. Råkortene (SYK-07/08) foreslår det, men det er ikke besluttet. SMS må dessuten veies mot varseltrøtthet — én tidsriktig påminnelse, ikke mas.",
    measurements: {
      primary: ["Andel som vurderer behov innen uke 4"],
      proxy: ["Varsel vist / åpnet", "Besøk på flate etter SMS"],
    },
    guardrail:
      "Unngå varseltrøtthet og for tidlig press; ikke duplikat når plan eller vurdering allerede finnes.",
    sharedWithAg: "AG steg 02",
  },
  {
    n: "03",
    id: "behovsvurdering",
    time: "Uke 3–4",
    date: "27. januar – 3. februar",
    title: "Jonas tar stilling selv",
    icon: "checklist",
    scope: "both",
    underAvklaring: "Mest usikre grep — under avklaring",
    actorGoal:
      "Jonas må kunne gjøre en egen vurdering: trengs en plan nå — og si fra uten å vente på leder.",
    today: {
      text: "I dag finnes ingen flate der den sykmeldte selv vurderer behovet for en plan. Initiativet hviler på arbeidsgiver; Jonas er strukturelt en passiv part.",
      barrier:
        "Når man ikke har et sted å si «ja, jeg trenger dette» (eller «ikke nå»), gjør man ingenting.",
    },
    lawIdeal:
      "Slik det burde være: behov for plan vurderes rundt uke 4 — av begge parter.",
    barriere: {
      kategori: "Manglende rutiner",
      detalj:
        "Ingen flate for at den sykmeldte vurderer behov selv; varselet når aldri fram til arbeidsgiver.",
    },
    motivasjon: {
      driver: "Autonomi og eierskap",
      detalj:
        "Å få vurdere selv — ikke bare vente på leder — gir eierskap i egen oppfølging.",
    },
    dult: {
      intervention:
        "En enkel oppgave på «Min side for sykmeldte» (varsel/bjella): ta stilling til behovet. Vurderingen kan deles med Nav, og «ja» trigger et varsel til arbeidsgiver — den toveis koblingen.",
      nudge: {
        channel: "minside-sykmeldt",
        title: "Trenger du en oppfølgingsplan nå?",
        body: "Svar enkelt: ja, jeg vil lage en plan med lederen min — eller ikke ennå. Sier du ja, får arbeidsgiver beskjed.",
        cta: "Ta stilling",
      },
      desiredBehavior: "Jonas tar et bevisst valg, og varselet når leder.",
      refs: ["ST05", "ST06", "SYK-09", "SYK-R3", "SYK-R4"],
    },
    consideration:
      "Dette er det mest usikre grepet: om den sykmeldte selv skal kunne vurdere behovet og varsle arbeidsgiver er ikke besluttet — arbeidsgiver eier oppfølgingsplanen, og sykmeldts «ja» er et innspill, ikke et vedtak. Vi viser det som en mulighet, ikke en vedtatt flyt. (Kartleggingsspørsmålene i pilot Troms og Finnmark, uke ~7, kan dessuten bli en egen anledning til å vurdere behov — men forveksles lett med oppfølgingsplanen.)",
    measurements: {
      primary: [
        "Antall egne behovsvurderinger innen uke 4",
        "Andel «ja» som utløser AG-varsel",
        "Andel delt med Nav",
      ],
    },
    guardrail:
      "Tydelig samtykke om deling; ingen forhåndsvalgt default. «Ikke nå» må være et reelt valg, ikke en snarvei bort fra medvirkning.",
    sharedWithAg: "AG steg 03",
  },
  {
    n: "04",
    id: "samtale",
    time: "Etter vurdering",
    date: "uke 4–5",
    title: "Forbered samtalen med leder",
    icon: "chat",
    scope: "both",
    actorGoal:
      "Jonas vil møte forberedt — og se hva han faktisk kan bidra med mens han er sykmeldt.",
    today: {
      text: "Jonas går ofte uforberedt inn i samtalen, usikker på hva en plan er og hva man kan eller bør si. Planen oppleves som arbeidsgivers dokument.",
      barrier:
        "Samtalen er personlig og kan være vanskelig; mange vet ikke at de kan bidra med andre oppgaver.",
    },
    lawIdeal:
      "Slik det burde være: en samtale om tilrettelegging som munner ut i en oppfølgingsplan.",
    barriere: {
      kategori: "Relasjon og tillit",
      detalj:
        "Samtalen er personlig; en ung ansatt vil ikke alltid snakke med leder, og leder kan være en tidligere «kompis». Usikkerhet gjør at man bidrar lite.",
    },
    motivasjon: {
      driver: "Autonomi og eierskap",
      detalj:
        "Forberedelse gir trygghet og en reell stemme i egen plan — og «sykmeldt fra oppgavene» åpner et mulighetsrom mange ikke visste fantes.",
    },
    dult: {
      intervention:
        "Et forberedelsesskjema («hva bør du tenke på når du skal lage en plan med lederen din») + samtaleguide, med framingen «sykmeldt fra oppgavene, ikke arbeidsplassen» og konkrete eksempler på hva man kan gjøre.",
      nudge: {
        channel: "plan",
        title: "Klar for samtalen med lederen din?",
        body: "Vi har gjort klar noen ting det kan være lurt å tenke gjennom. Husk: du er sykmeldt fra oppgavene dine, ikke fra arbeidsplassen.",
        cta: "Forbered deg",
      },
      desiredBehavior: "Jonas møter forberedt og bidrar reelt i planen.",
      refs: ["ST07", "ST08", "ST09", "SYK-11", "SYK-12", "SYK-13", "SYK-14"],
    },
    measurements: {
      primary: [
        "% sykmeldte som føler seg ivaretatt ved første samtale (Lumi)",
        "% som vet hva de kan bidra med",
      ],
      proxy: ["Visninger av forberedelsesskjema før plan"],
    },
    guardrail:
      "Ikke be om diagnose eller private forhold; en hjelp, ikke et nytt krav. Aldri «du burde jobbe mer» — helsen styrer.",
    sharedWithAg: "AG steg 04",
  },
  {
    n: "05",
    id: "medvirke-dele",
    time: "Når plan finnes",
    date: "uke 5–6",
    title: "Medvirke i og dele planen",
    icon: "share",
    scope: "both",
    actorGoal:
      "Jonas vil være en aktiv part i planen — og kunne dele den selv.",
    today: {
      text: "I den nye planen er det bare arbeidsgiver som skriver; Jonas er strukturelt en passiv part. Deling med lege og Nav initieres av arbeidsgiver.",
      barrier:
        "Ingen funksjon for at den sykmeldte skriver inn, kommenterer eller deler planen selv.",
    },
    lawIdeal:
      "Slik det burde være: planen lages sammen, og deles med fastlegen (uke 4–6) og Nav ved behov.",
    barriere: {
      kategori: "Manglende rutiner",
      detalj:
        "Teknisk er den sykmeldte utestengt fra å skrive i planen — strukturen gjør ham passiv.",
    },
    motivasjon: {
      driver: "Autonomi og eierskap",
      detalj:
        "Reell medvirkning er selve motgiften mot «passiv part» — planen blir deres, ikke bare lederens.",
    },
    dult: {
      intervention:
        "La Jonas skrive inn og kommentere i planen (asynkront), be arbeidsgiver lage en plan (→ AG-oppgave), og kunne dele planen med lege eller Nav selv.",
      nudge: {
        channel: "plan",
        title: "Planen er deres — ikke bare lederens",
        body: "Du kan legge til det du mener er viktig, og dele planen med fastlegen din. Det legen vet om jobben din, hjelper hen å vurdere gradert sykmelding.",
        cta: "Se planen",
      },
      desiredBehavior: "Jonas medvirker konkret, og planen deles tidligere.",
      refs: ["ST10", "SYK-R3", "Målmodell H2"],
    },
    consideration:
      "Må ikke føre til dobbel-varsling når planen allerede er delt, eller til at sensitive opplysninger deles ukritisk.",
    measurements: {
      primary: [
        "Andel planer med sykmeldt-medvirkning",
        "Deling med lege/Nav opp",
        "Tidlig deling (aggregert)",
      ],
    },
    guardrail: "Deling skal aldri føles som press; tydelig hvem som ser hva.",
    sharedWithAg: "AG steg 04–05",
  },
  {
    n: "06",
    id: "evaluering",
    time: "Videre oppfølging",
    date: "uke 12",
    title: "Evaluering og kontinuitet",
    icon: "calendar",
    scope: "both",
    actorGoal:
      "Jonas og Maria må finne ut om tiltakene virker, og justere planen ved behov.",
    today: {
      text: "Planen har en evalueringsdato, men ingenting minner Jonas om den, og evalueringen gir lite støtte. Planen blir et engangsdokument.",
      barrier:
        "Ingen påminnelse, ingen oppsummering av hva man ble enige om — så datoen forsvinner i hverdagen.",
    },
    lawIdeal:
      "Slik det burde være: planen evalueres og justeres med den ansatte.",
    barriere: {
      kategori: "Manglende rutiner",
      detalj:
        "Uten påminnelse eller oppsummering forsvinner evalueringen; planen behandles som et engangsdokument.",
    },
    motivasjon: {
      driver: "Autonomi og eierskap",
      detalj:
        "Når planen er deres, levende og mulig å endre («ingenting er hugget i stein»), blir det naturlig å vende tilbake til den.",
    },
    dult: {
      intervention:
        "Jonas lager ikke planen selv, så han setter ikke opp påminnelsen. Arbeidsgiver velger den i planen — og sier de ja, får Jonas den automatisk på «Min side for sykmeldte» (+ SMS) noen dager før, med en mal for hva han bør ta stilling til.",
      setupNote:
        "Arbeidsgiver velger påminnelsen i planen — du får den automatisk.",
      nudge: {
        channel: "minside-sykmeldt",
        via: "sms",
        title: "Snart tid for å evaluere planen",
        body: "Om noen dager er det lurt å se på hva som fungerer for deg nå, og hva som fortsatt er vanskelig. Forbered det som er viktig for deg.",
        cta: "Forbered evalueringen",
      },
      desiredBehavior:
        "Jonas forbereder og deltar i evalueringen; planen justeres.",
      refs: ["ST11", "ST12", "SYK-15", "SYK-16", "SYK-17", "SYK-18"],
    },
    consideration:
      "Større grep (ikke scopet inn nå, men viktig kontekst): gjøre selve planen til et levende dokument — vise forrige samtale og la den oppdateres i stedet for å måtte lages på nytt.",
    measurements: {
      primary: [
        "Evalueringsdato satt, og påminnelse valgt",
        "Flere som faktisk evaluerer planen",
        "Rating av tiltak",
      ],
      proxy: ["Plan åpnet og justert senere"],
    },
    guardrail:
      "Ingen skjult default på varsling; unngå skyld-språk når et tiltak ikke virket. Ikke gjør flere planer til et krav.",
    sharedWithAg: "AG steg 06",
  },
];

const overordnetMaal: OverordnetMaal = {
  eyebrow: "Mål bak reisen",
  oppdrag:
    "Dulting for å gjøre den sykmeldte til en informert, medvirkende part — og øke etterlevelsen av medvirknings- og aktivitetsplikten, med mål om å redusere sykefraværet (AID / IA-avtalen 2025–2028).",
  kr: [
    "Egen behovsvurdering — og tidligere",
    "Flere tar stilling til behov innen uke 4",
    "Plan delt uten å vente på veileder",
    "Forberedt og medvirkende i dialogmøte 1",
    "Økt gradert sykmelding · kortere sykefravær",
  ],
  dialogmote1Note:
    "Dialogmøte 1 (innen uke 7) ligger i samme horisont. En forberedt, medvirkende sykmeldt gjør møtet bedre — men selve møtet er en egen satsing; her mater medvirkningen i planen rett inn i det.",
};

/** Samlet brukerreise for den sykmeldte — injiseres i komponentene. */
export const sykmeldtJourney: JourneyData = {
  mission,
  persona,
  phases,
  overordnetMaal,
  contrast,
};
