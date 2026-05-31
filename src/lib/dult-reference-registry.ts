/**
 * Typesikkert register over DULT-tiltakene som brukerreisen refererer til.
 * Innholdet er hentet fra `docs/dulting-tiltaksregister.md` og fungerer
 * som single source of truth for klikkbare DULT-referanser i UI.
 *
 * Nye DULT-IDer må legges til her før de kan brukes som kilde i
 * `aid-user-journey-model.ts`. Test i `dult-reference-registry.test.ts`
 * sjekker at alle DULT-prefiksede kilder i brukerreisen finnes i registeret.
 */

export type DultId = `DULT-${string}`;

export type DultReference = {
  id: DultId;
  title: string;
  summary: string;
  /** Klyngen tiltaket er gruppert under i tiltaksregisteret. */
  cluster: string;
  /** Status fra tiltaksregisteret — om tiltaket er med i første test, støtte, senere eller avklaring. */
  status:
    | "Med i første test"
    | "Støtte"
    | "Senere"
    | "Avklaring"
    | "Utenfor første pakke";
};

const REGISTRY = {
  "DULT-01": {
    id: "DULT-01",
    title: "Kartlegge behov for oppfølgingsplan",
    summary:
      "Arbeidsgiver vurderer om oppfølgingsplan er nødvendig. Kjerne i behovsvurderingen.",
    cluster: "Behovsvurdering i Dine sykmeldte",
    status: "Med i første test",
  },
  "DULT-02": {
    id: "DULT-02",
    title: "Vise verdien av oppfølging",
    summary:
      "Kort tekst som forklarer hvorfor oppfølging er verdifullt for arbeidsgiver og ansatt.",
    cluster: "Støttende tekst og forståelse",
    status: "Støtte",
  },
  "DULT-05": {
    id: "DULT-05",
    title: "Miniguide til oppfølgingsplanen",
    summary:
      "Stegvis veiledning som bryter ned planarbeidet til håndterbare steg med handlingsverb, uten juridisk sjargong.",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-06": {
    id: "DULT-06",
    title: "Tidsriktig varsel om oppfølgingsplan",
    summary:
      "Arbeidsgiver blir gjort oppmerksom på planbehov tidlig nok — typisk når fraværet nærmer seg fire uker. Trigger må avklares.",
    cluster: "Tidsriktig varsel",
    status: "Med i første test",
  },
  "DULT-07": {
    id: "DULT-07",
    title: "Konkret oppgave på Dine sykmeldte",
    summary:
      "Gjør flaten handlingsrettet i stedet for passiv informasjon. Arbeidsgiver får noe å gjøre, ikke bare lese.",
    cluster: "Behovsvurdering i Dine sykmeldte",
    status: "Med i første test",
  },
  "DULT-08": {
    id: "DULT-08",
    title: "Markere utførte oppgaver",
    summary:
      "Arbeidsgiver får oversikt over hva som er gjort og hva som gjenstår i oppfølgingsarbeidet.",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-10": {
    id: "DULT-10",
    title: "Synliggjøre arbeidsgivers plikt",
    summary:
      "Mikrotekst om plikt og ansvar, formulert uten å presse fram feil handling.",
    cluster: "Støttende tekst og forståelse",
    status: "Støtte",
  },
  "DULT-11": {
    id: "DULT-11",
    title: "Rett til riktig person",
    summary:
      "Arbeidsgiver kommer raskt til riktig kontekst når sykmeldingen åpnes, slik at neste handling er åpenbar.",
    cluster: "Behovsvurdering i Dine sykmeldte",
    status: "Støtte",
  },
  "DULT-12": {
    id: "DULT-12",
    title: "Kalenderavtale for evaluering",
    summary:
      "Arbeidsgiver og sykmeldt avtaler evaluering av planen. Berører sykmeldt-sporet og må vurderes der senere.",
    cluster: "Evaluering og påminnelser",
    status: "Senere",
  },
  "DULT-13": {
    id: "DULT-13",
    title: "Rydde tekst på berørt skjerm",
    summary:
      "Arbeidsgiver forstår tekst og begreper uten friksjon. Aktuelt hvis første test berører samme skjerm.",
    cluster: "Tekst og skjermrydding",
    status: "Støtte",
  },
  "DULT-15": {
    id: "DULT-15",
    title: "Svare at plan ikke trengs nå",
    summary:
      "Arbeidsgiver kan velge riktig handling når plan ikke trengs. Må ha guardrails så valget ikke blir en snarvei bort fra plikten.",
    cluster: "Behovsvurdering i Dine sykmeldte",
    status: "Med i første test",
  },
  "DULT-16": {
    id: "DULT-16",
    title: "Strukturert begrunnelse til Nav",
    summary:
      "Arbeidsgiver gir strukturert begrunnelse når plan ikke er aktuell. Fritekst skal ikke inn i første test uten juridisk avklaring, DPIA og PII-guardrails.",
    cluster: "Behovsvurdering i Dine sykmeldte",
    status: "Avklaring",
  },
  "DULT-19": {
    id: "DULT-19",
    title: "Synliggjøre lagrede utkast",
    summary:
      "Arbeidsgiver ser status for utkast tydeligere og kan gjenoppta påbegynt arbeid. Aktuelt hvis første test gir planstart med lav fullføring.",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-20": {
    id: "DULT-20",
    title: "Frist på riktig person",
    summary:
      "Arbeidsgiver ser frist for oppfølgingsplan på riktig person i Dine sykmeldte. Henger tett sammen med DULT-06 og krever presis fristregel.",
    cluster: "Tidsriktig varsel",
    status: "Med i første test",
  },
  "DULT-22": {
    id: "DULT-22",
    title: "Påminnelse før planarbeidet starter",
    summary:
      "Mulighet for å foreslå kalenderavtale eller påminnelse før arbeidsgiver lager plan. Berører sykmeldt-sporet.",
    cluster: "Evaluering og påminnelser",
    status: "Senere",
  },
  "DULT-24": {
    id: "DULT-24",
    title: "Bedre informasjon i planflyten",
    summary:
      "Arbeidsgiver møter stegvis forklaring av hvordan de følger opp den ansatte og lager plan når de kommer inn på oppfølgingsplansiden.",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-26": {
    id: "DULT-26",
    title: "Tidlig deling med legen via dulting",
    summary:
      "Oppfordre arbeidsgiver til å dele planen med fastlegen tidlig, med dulteteknikker som urgency og forhåndsutfylt valg for legen.",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-27": {
    id: "DULT-27",
    title: "Forklare hvorfor planen deles",
    summary:
      "Tekst som forklarer verdien av å dele oppfølgingsplanen med fastlege og Nav tidlig.",
    cluster: "Støttende tekst og forståelse",
    status: "Støtte",
  },
  "DULT-29": {
    id: "DULT-29",
    title: "Plan som kan revideres",
    summary:
      "Oppfølgingsplanen kan endres gjennom perioder på samme plan — «ingenting er hugget i stein».",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-30": {
    id: "DULT-30",
    title: "Sykmeldt kan også dele planen",
    summary:
      "La den ansatte også dele oppfølgingsplanen med lege og Nav. Kryss-aktør — kobles til sykmeldt-sporet.",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-31": {
    id: "DULT-31",
    title: "«Endre/juster/oppdater plan»-knapp",
    summary:
      "Tydelig handling for å oppdatere en aktiv plan, i stedet for å måtte lage en ny fra bunnen.",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-32": {
    id: "DULT-32",
    title: "Revampet Dine sykmeldte som guider samtalen",
    summary:
      "Flaten guider hele oppfølgingssamtalen — hvilke spørsmål, hva en plan er, hvem man deler med og når. Bredere enn miniguiden (DULT-05).",
    cluster: "Stegvis hjelp i planflyt",
    status: "Senere",
  },
  "DULT-35": {
    id: "DULT-35",
    title: "Tydeliggjøre aktiv plan",
    summary: "Gjøre det synlig hvilken plan som er den siste/aktive.",
    cluster: "Tekst og skjermrydding",
    status: "Senere",
  },
} satisfies Record<string, DultReference>;

export type RegisteredDultId = keyof typeof REGISTRY;

/** Sjekker om en tilfeldig streng er på formen `DULT-...`. */
export function isDultId(value: string): value is DultId {
  return /^DULT-[A-Za-z0-9]+$/.test(value);
}

/** Sjekker om en DULT-ID finnes i registeret. */
export function isRegisteredDultId(value: string): value is RegisteredDultId {
  return Object.hasOwn(REGISTRY, value);
}

/** Returnerer DULT-referansen hvis den finnes, ellers `undefined`. */
export function getDultReference(id: string): DultReference | undefined {
  if (!isRegisteredDultId(id)) {
    return undefined;
  }
  return REGISTRY[id];
}

/** Alle registrerte DULT-referanser, sortert på ID. */
export function listDultReferences(): DultReference[] {
  return Object.values(REGISTRY).sort((a, b) => a.id.localeCompare(b.id));
}
