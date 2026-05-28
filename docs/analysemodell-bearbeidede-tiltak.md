# Analysemodell for bearbeidede tiltak

**Beslutning:** Bearbeidede tiltak, også kalt tiltakskandidater, er nivået der
Studio kobler redaksjonell innsikt fra Mural til ønsket atferd, måletegn,
guardrails og beslutningsgrunnlag. Måletegn skal ligge på tiltakskandidaten,
ikke på rå widgets eller Studio-klynger.

Dette dokumentet er en konseptuell analysemodell for #23. Det innfører ingen
migrasjoner, API-kontrakter eller bindende database-enumer. Felt og statusord
må konkretiseres på nytt når #13, #14 eller senere implementering lager skjema,
API og UI.

## 1. Nivåer i modellen

| Nivå | Hva det er | Hva nivået ikke er |
|---|---|---|
| Rå widget | Dataminimert importert Mural-widget med intern `widgetId` og sporbar `muralWidgetId`. | Ikke en beslutning, ikke et ferdig tiltak og ikke et sted for validerte måletegn. |
| Klassifisering | Første sortering av rå widget, for eksempel type, aktørspor, brukerreisesteg, lane, konfidens og redaksjonelle notater. | Ikke kanonisk analyse og ikke dokumentert effekt. |
| Studio-klynge | Første lagrede redaksjonelle nivå. Samler flere widgets som hører sammen tematisk eller atferdsmessig. | Ikke tiltakskandidat, ikke tiltakspakke og ikke sted for FORGOOD/EAST/Fogg-score eller målescore. |
| Tiltakskandidat | Bearbeidet forslag med ønsket atferd, hypotese, kildegrunnlag, måletegn, guardrails, FORGOOD-flagg og åpne spørsmål. | Ikke nødvendigvis godkjent tiltak. Ikke produksjonsendring. |
| Tiltakspakke | Kuratert samling av tiltakskandidater med felles formål, dekning, risiko og måleopplegg. | Ikke rå workshop-arkiv og ikke effektanalyse alene. |

Klassifisering er tatt med som eksisterende mellomsteg fordi Studio allerede
har klassifisering av widgets. Det er ikke et nytt beslutningsnivå mellom
klynge og tiltakskandidat.

Hovedregelen er at Mural og inboxen kan inneholde mange løse forslag, mens
tiltakskandidaten er første nivå der teamet aktivt sier: "Dette kan være et
tiltak vi vil vurdere videre."

## 2. Felt på tiltakskandidat

Feltlisten beskriver hva en tiltakskandidat bør kunne bære som analysegrunnlag.
Den er ikke en teknisk kontrakt.

| Felt | Beskrivelse | Merknad |
|---|---|---|
| Tittel | Kort navn som beskriver tiltaket eller endringen. | Skal kunne leses uten rå Mural-kontekst. |
| Status | Redaksjonell beslutningsstatus. | Se statusforslag under. Ikke bruk Studio-klynge-statusene `draft` og `validated` her uten ny vurdering. |
| Ønsket atferd | Hva aktøren skal gjøre annerledes hvis tiltaket virker. | Må være konkret nok til at vi kan finne måletegn. |
| Aktørspor | Hvem tiltaket primært retter seg mot, for eksempel arbeidsgiver, sykmeldt eller begge. | Første pakke gjelder primært arbeidsgiver. |
| Brukerreisesteg | Hvor i reisen tiltaket virker. | K6/støtte kan markeres som tverrgående i stedet for vanlig steg. |
| Plassering/rolle | Om kandidaten er reisesteg, tverrgående støtte, pakkestøtte, avklaring eller kontekst. | Hindrer at støttetiltak blir feilplassert som ordinære steg. |
| Hypotese | Hvis vi gjør X, forventer vi Y fordi Z. | Skal kobles til H1/H2 når relevant. |
| Måletegn | Aktivitet, kvalitet, guardrails og eventuelt overordnet effekt. | Skal følge strukturen i [målmodellen](maalmodell-virkningshypotese.md). |
| Guardrails | Uønskede utslag vi må følge med på. | Kan være juridisk, etisk, innholdsmessig, datamessig eller brukeropplevelse. |
| FORGOOD-flagg | Kvalitative flagg for fairness, openness, respect, goals, opinions, options og delegation. | Ikke totalscore. Brukes til å synliggjøre risiko og avklaringer. |
| EAST/Fogg | Valgfri diagnostikk for friksjon, motivasjon, evne og prompt. | Brukes når det hjelper analysen, ikke som obligatorisk poengmodell. |
| Åpne spørsmål | Faglige, juridiske, tekniske, innholdsmessige eller datamessige avklaringer. | Må være synlige før tiltaket kan inngå i pakke eller test. |
| Kildekort | Dataminimert liste over widgets og klynger som ligger bak kandidaten. | Se sporbarhetsmodellen under. |
| Kunnskapshull | Hva vi ikke vet ennå, men må vite for å tolke tiltaket eller målingen. | Bør skilles fra vanlige åpne oppgaver. |

### Forslag til statusord

Statusordene bør beskrive redaksjonell beslutning, ikke teknisk lagring.

| Status | Betydning |
|---|---|
| Foreslått | Kandidaten er formulert, men ikke vurdert nok til å inngå i pakke. |
| Trenger avklaring | Kandidaten kan være relevant, men stopper på juridisk, faglig, teknisk, datamessig eller innholdsmessig avklaring. |
| Vurdert relevant | Kandidaten er relevant nok til å vurderes for tiltakspakke. |
| Klar for pakketesting | Kandidaten kan inngå i en foreslått tiltakspakke, gitt vanlige review- og PII-stoppunkter. |
| Parkert | Kandidaten kan være relevant senere, men hører ikke hjemme i første pakke. |
| Forkastet | Kandidaten skal ikke tas videre slik den står nå. |

Dette harmonerer med statusordene i `dulting-redaktor` og
tiltaksregisteret, men låser ikke en endelig enum. Før en teknisk
implementering må vi avklare om statusene skal være norske brukerord, tekniske
alias eller begge deler.

## 3. Måletegn hører til tiltakskandidaten

Rå widgets og Studio-klynger kan inneholde målelapper, ideer og spørsmål. De er
ikke nok til å definere hva som skal måles. Validerte måletegn hører til
tiltakskandidaten fordi det først er der vi kjenner:

- ønsket atferd
- hypotese
- aktørspor og brukerreisesteg
- risiko og guardrails
- datakilde og personvernramme

Et måletegn på tiltakskandidat bør minst beskrive:

| Del | Eksempel |
|---|---|
| Målenivå | Aktivitet, kvalitet, guardrail eller overordnet effekt. |
| Tegn | "Arbeidsgiver starter behovsvurdering" eller "andel 'plan trengs ikke nå'". |
| Datakilde | Eksisterende data, ny instrumentering eller survey. |
| H1/H2-kobling | H1 for tidligere oppfølging, H2 for bedre informasjonsgrunnlag for lege/Nav. |
| Tolkning | Hva tegnet kan si, og hva det ikke kan si. |
| Kunnskapshull | Hva som må avklares før målet kan brukes trygt. |
| Personvernmerking | Om målingen krever ny instrumentering, survey, kobling mot fagsystemdata eller særskilt vurdering. |

Sykefravær, gradering og arbeidsdeltakelse er distale effektmål. De kan være
langsiktige hypoteser, men skal ikke være primær KPI for første test.

## 4. Sporbarhet til bakgrunnen

Brukeren må kunne se hvorfor en tiltakskandidat finnes uten at Studio blir et
råarkiv for Mural. Sporbarhet bør gå gjennom dataminimerte kildekort.

Et kildekort kan inneholde:

- intern `widgetId`
- `muralWidgetId`
- eventuell Studio-klynge kandidaten kommer fra
- sanitert utdrag eller kort oppsummering
- klassifisering, for eksempel type, aktørspor og brukerreisesteg
- PII-vurdering: ingen synlig risiko, mulig risiko eller sannsynlig risiko
- kort begrunnelse for hvorfor kilden er relevant

Et kildekort skal ikke inneholde:

- rå Mural JSON
- fulle eksportdata
- posisjonsdata som ikke trengs for forståelse
- saksnær tekst, personopplysninger eller helseopplysninger
- fritekst med uavklart PII-risiko

Hvis en kilde har mulig eller sannsynlig PII-risiko, skal kandidaten bare vise
kilde-ID, risikomerking og en sanitert begrunnelse. Originaltekst må håndteres
manuelt utenfor repo og utenfor ordinær analysemodell.

## 5. K6 og støttetiltak

K6/støttetiltak skal kunne støtte flere steg i reisen uten å bli et eget
ordinært reisesteg. Bruk derfor et strukturert felt for plassering/rolle i
stedet for bare et ja/nei-flagg.

| Rolle | Når brukes den |
|---|---|
| Reisesteg | Tiltaket virker på ett hovedsteg i reisen. |
| Tverrgående støtte | Tiltaket støtter flere steg, for eksempel tekst, begreper eller verdi-/pliktsforståelse. |
| Pakkestøtte | Tiltaket gjør pakken tryggere eller mer forståelig, men er ikke en egen testbar enhet. |
| Avklaring | Kandidaten peker på noe som må avklares før det kan bli tiltak. |
| Kontekst | Kandidaten forklarer bakgrunn, men er ikke et tiltak. |

For første pakke betyr dette at **Støttende tekst og forståelse** kan følge
signal og behovsvurdering som støttekomponent. Den skal ikke få samme status som
hovedklyngene **Tidsriktig signal** og **Behovsvurdering i Dine sykmeldte** uten
en ny beslutning.

## 6. Strukturert modell for behovsvurdering

Behovsvurderingen må gjøre det mulig å velge riktig neste steg uten å lage en
snarvei bort fra arbeidsgivers plikt.

Første modell bør bruke radiovalg uten forhåndsvalgt default:

| Valg | Betydning | Neste steg |
|---|---|---|
| Start oppfølgingsplan | Arbeidsgiver vurderer at plan bør lages nå. | Gå til planstart eller relevant planflyt. |
| Plan trengs ikke nå | Arbeidsgiver vurderer at plan ikke er riktig tiltak akkurat nå. | Velg strukturert årsak og vis tydelig at plikten til oppfølging fortsatt gjelder. |
| Plan er allerede startet | Arbeidsgiver har allerede begynt eller har relevant plan. | Vis status, fortsett plan eller gå til riktig eksisterende plan. |
| Trenger å snakke med den ansatte først | Arbeidsgiver trenger samtale før riktig valg kan tas. | Gi lavterskel neste steg, uten å registrere helseopplysninger. |

Årsaker bør være forhåndsdefinerte og vurdert faglig og juridisk før test. De må
ikke be om diagnose, helseopplysninger, private forhold eller saksnære
forklaringer.

Fritekst og "annet" skal ikke være standard i første test:

- Ingen fritekst som målegrunnlag uten særskilt behandlingsgrunnlag.
- "Annet" bør enten være en strukturert årsak eller markeres som "krever
  avklaring".
- Hvis fritekst vurderes senere, krever det juridisk avklaring, DPIA-vurdering,
  dataminimering, tydelig formål, tilgangsstyring og PII-/helsedata-guardrails.
- "Plan trengs ikke nå" skal aldri være forhåndsvalgt.

## 7. Forholdet til målmodellen

[Målmodellen](maalmodell-virkningshypotese.md) er premiss for hvordan
tiltakskandidaten beskriver måletegn.

| Målmodellfelt | Hvordan det brukes på tiltakskandidat |
|---|---|
| H1 | Koble tiltak som skal gi tidligere oppfølging, samtale, behovsvurdering eller planstart. |
| H2 | Koble tiltak som kan gi tidligere eller bedre delt plan til lege/Nav. |
| Aktivitet | Beskriv observerbare handlinger i flyten. |
| Kvalitet | Beskriv tegn på forståelse, relevant handling eller meningsfull planbruk. |
| Guardrails | Beskriv uønsket bruk, feil press, støy, frafall, fritekst eller PII-risiko. |
| Overordnet effekt | Beskriv distale hypoteser, ikke primær KPI for første test. |
| Datakilde | Skill eksisterende data, ny instrumentering og survey. |
| Kunnskapshull | Vis hva teamet må avklare før målet kan tolkes. |

## 8. Relasjon til eksisterende issues

| Issue | Status | Relasjon til #23 |
|---|---|---|
| #13 Promoter inbox-items til kanoniske tiltak | Åpen | Bør bruke tiltakskandidatmodellen når Studio får promotering fra widget/klynge til tiltak. |
| #14 Bygg tiltakspakkevisning og eksport | Åpen | Bør vise tiltakskandidater, måletegn, guardrails, kildekort og støttekomponenter etter denne modellen. |
| #17 Redaksjonsmodell for strukturert Mural-arbeid | Lukket | Gir input: skille mellom rå widget, Studio-klynge og senere tiltak. Ikke en åpen avhengighet. |
| #18 Datamodell og service for redaksjonelle klynger | Lukket | Gir input: lagret klyngenivå og medlemskap. Ikke en tiltakskandidatmodell. |
| #22 Migrer brukerreise og tiltakskart til React-app | Åpen | Bør bruke rolle/plassering og K6-støtte slik at tiltakskartet ikke gjør støttetiltak til vanlige reisesteg. |
| #24 Målmodell og virkningshypotese | Lukket | Gir input for målenivå, datakilde, H1/H2 og personvernramme. |

## 9. Akseptanse for en tiltakskandidat

En tiltakskandidat er godt nok beskrevet når den:

- har tydelig ønsket atferd
- peker til kilder gjennom dataminimerte kildekort
- skiller hypotese fra dokumentert kunnskap
- har minst ett nærliggende måletegn hvis den skal inn i test
- har relevante guardrails
- markerer FORGOOD-risiko og åpne spørsmål
- sier om den er reisesteg, tverrgående støtte, pakkestøtte, avklaring eller
  kontekst
- skiller eksisterende data fra ny instrumentering og survey
- har PII- og fritekstgrenser som kan vurderes før test eller eksport
