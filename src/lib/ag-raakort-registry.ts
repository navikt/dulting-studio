/**
 * Register over de opprinnelige AG-råkortene (AG-*) med teksten VERBATIM fra
 * workshop-tavla — ikke bearbeidet. Så et tiltak kan vise nøyaktig hva det er
 * bygget på. Motstykket er `sykmeldt-raakort-registry.ts` (SYK-*).
 *
 * Kilde: `docs/dulting-tiltaksregister.md` — «Råkort og mapping» (DULT-01..25)
 * + «Tilleggsråkort fra tavla» (DULT-26..35). «Råkort»-kolonnen, ordrett.
 * NB: kodene het DULT-NN i kilden; vi bruker AG-NN her (samme kort, omdøpt for
 * å unngå kollisjon med «dult» = selve intervensjonen). 1:1 med doc-ens DULT-NN.
 */
const AG_RAAKORT: Record<string, string> = {
  "AG-01": "Kartlegge behov for oppfølgingsplan",
  "AG-02":
    "En kort tekst som sier noe om verdien ved å følge opp sine sykmeldte",
  "AG-05":
    "Lag en miniguide innledningsvis til oppfølgingsplanen, eks: 1. Ta en prat først. En kort, uformell samtale gjør alt enklere. Snakk om hva som fungerer og hva som er vanskelig. 2. Skriv ned det viktigste Dere trenger ikke den perfekte løsningen. Bli enige om noe å prøve. 3. Del planen Del med fastlegen og Nav med et par klikk. Bryt prosessen ned til håndterbare steg med handlingsverb. Fjerner juridisk sjargong og fokuserer på hva bruker faktisk skal gjøre.",
  "AG-06":
    "Når den ansatte har en sykmelding som kommer til å passere 4 uker (eller allerede med første sykmelding) får de ekstra informasjon om at det skal lages en oppfølgingsplan sammen med sykmeldingen på Dine sykmeldte. De bør fylle ut vurdering av behovet. Kan det komme en pop-up i kvitteringen til sykmeldingen?",
  "AG-07":
    'Per i dag er det ingen "oppgaver" å gjøre når de mottar sykmelding, det er en passiv side med informasjon om gradering og varighet. Kan vi gi dem en gjøre-liste eller noen oppgaver?',
  "AG-08":
    "Kan vi gjøre det mulig for brukerne å markere at de har løst en oppgave, stykke opp oppgaver? Hva bør man gjøre og hva gjenstår?",
  "AG-11":
    "Når arbeidsgiver logger seg inn på Dine sykmeldte når hen mottar en sykmelding, burde de komme rett inn på personen det gjelder for å se sykmeldingen. Eller i hvert fall tydeliggjøre hvor man skal trykke for å se eller gjøre noe.",
  "AG-12": "Bruke kalenderavtale til evaluering av oppfølgingsplan",
  "AG-15":
    "Det burde være funksjonalitet for at arbeidsgiver kan oppgi at det ikke er behov for oppfølgingsplan",
  "AG-16":
    "Når Nav ber om oppfølgingsplan og arbeidsgiver vurderer at det ikke er aktuelt, bør de kunne begrunne dette med avhuking av årsak og fritekst og dele med Nav (ligger til grunn at vi har et vurderingsskjema)",
  "AG-17":
    "Når arbeidsgiver behandler sykmeldingen, kan det ligge en sjekkliste/guide hvor vi informerer om plikter med tips og råd om hvordan de bør følge opp sykmeldte. Vi bør kanskje skille på gradering/full sykmelding og tilpasse guiden slik at den kan komme med eksempler basert på yrkesgrupper.",
  "AG-19": "Utkast lagret kan flyttes opp",
  "AG-20":
    '"frist for oppfølgingsplan: x dager" på en person i "Dine sykmeldte", dersom sykmeldingsperioden tilsier det',
  "AG-22":
    "Mulighet for å generere kalenderavtale før en person selv velger å lage en plan, foreslå om de vil ha påminnelse",
  "AG-24":
    "Når arbeidsgiver kommer inn på oppfølgingsplansiden er det bedre informasjon og en stegvis forklaring av hvordan følge opp den ansatte og lage en plan",
  "AG-26":
    "Oppfordre arbeidsgiver til å dele med legen så tidlig som mulig (eks skisse). Ta i bruk dulteteknikker som trigger: urgency / forhåndsutfylt valg for fastlegen",
  "AG-27": "Det burde stå om hvorfor man skal dele planen med fastlege og Nav",
  "AG-28":
    "Dersom de ikke kan lagres lengre enn 4 måneder hos Nav, kan arbeidsgiver anbefales å lagre planene hos seg så de kan bruke de senere … man kan gjenbruke masse fra en annens tidligere plan? — hvorfor lagres den ikke lenger og hvor de kan finne den igjen?",
  "AG-29":
    "Oppfølgingsplanen fungerer slik at den kan reverseres, man kan endre innholdet gjennom perioder på samme plan. «Ingenting er hugget i stein …»",
  "AG-31": "Ha med en knapp inne på planen «endre/juster/oppdater plan»",
  "AG-33":
    "Dersom man ikke har behov for en plan kan man her oppgi det, og dele infoen med nav og lege.",
  "AG-35": "Ikke synlig nok at det er den siste / aktive plan",
};

/** Verbatim råkort-tekst for en AG-kode, eller undefined hvis ukjent. */
export function getAgRaakort(id: string): string | undefined {
  return AG_RAAKORT[id];
}
