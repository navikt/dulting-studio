# Manuelle PII-stoppunkter

**Beslutning:** Dulting Studio skal ha manuelle PII-stoppunkter før import,
promotering til tiltakskandidat og eksport/godkjenning. Stoppunktene skal
hindre at personopplysninger, saksnær tekst eller rå Mural-data blir lagret,
videreført eller eksportert.

Dette dokumentet er en operativ sjekkliste for MVP-en. Det er ikke en juridisk
konklusjon, DPIA eller automatisk PII-deteksjon. Ved tvil skal teamet stoppe
arbeidet og eskalere til sikkerhetschampion, personvern eller juridisk rolle.

## 1. Hva som ikke skal inn

Studio skal ikke inneholde:

- fødselsnummer, D-nummer eller andre personidentifikatorer
- navn, e-post, telefonnummer eller andre kontaktopplysninger
- helseopplysninger, diagnose, sykmeldingsdetaljer eller arbeidsevnevurderinger
- konkrete saker, sitater fra enkeltsaker eller saksnære historier
- virksomhetsnavn eller små segmenter som kan gjøre personer eller arbeidsgivere
  gjenkjennelige
- rå Mural JSON, Mural-brukerdata, tidsstempler, URL-er, tokens eller
  integrasjonsmetadata
- fritekst som kan beskrive en person, arbeidsgiver eller konkret oppfølging

Tillatt innhold er redaksjonelt bearbeidet, ikke-identifiserende innhold på
konseptnivå.

## 2. Stoppunkt før import

Dette stoppunktet gjelder før en Mural-eksport eller et lokalt utdrag importeres
til Studio.

| Sjekk | Hva teamet gjør |
|---|---|
| Filplassering | Reell eksport ligger lokalt under `local-mural-exports/` eller tilsvarende gitignored mappe. |
| Rådata | Rå Mural JSON skal ikke committes, lastes opp som fixture eller lagres på server. |
| Innhold | Gå raskt gjennom utdraget for personnavn, e-post, telefon, fødselsnummer, saksnær tekst, helseopplysninger og virksomheter som kan identifiseres. |
| Metadata | Sjekk at importen bare sender dataminimert DTO. Owner-data, Mural-brukere, URL-er, tokens og rå HTML skal ikke videre. |
| Logger | Sjekk ved behov at importfeil og serverlogger ikke inneholder tekstinnhold, rå payload eller Mural-brukerdata. |
| Små grupper | Fjern eller omskriv innhold som peker på små eller sårbare grupper. |

**Hvis sjekken feiler:** Ikke importer. Rediger eller anonymiser lokalt først,
eller slett utdraget hvis det ikke kan brukes trygt.

## 3. Stoppunkt før promotering

Dette stoppunktet gjelder før rå widgets eller Studio-klynger løftes til
tiltakskandidat.

| Sjekk | Hva teamet gjør |
|---|---|
| Kildekort | Bruk dataminimerte kildekort med `widgetId`, `muralWidgetId`, klynge, sanitert utdrag/oppsummering og PII-vurdering. |
| Originaltekst | Ikke kopier saksnær originaltekst inn i tiltakskandidaten. Bruk sanitert oppsummering. |
| Ønsket atferd | Formuler ønsket atferd generelt, ikke som råd i en konkret sak. |
| Måletegn | Mål flyt og handling, ikke fritekst eller helseopplysninger. |
| Åpne spørsmål | Merk juridiske, faglige og personvernmessige avklaringer før kandidaten går videre. |

**Hvis sjekken feiler:** Ikke promoter. Parker kilden, anonymiser teksten eller
eskaler hvis innholdet kan være personopplysninger eller helseopplysninger.

## 4. Stoppunkt før eksport og godkjenning

Dette stoppunktet gjelder før tiltakskandidat, tiltakspakke eller
beslutningsgrunnlag eksporteres til Markdown, JSON, pull request eller annen
deling.

| Sjekk | Hva teamet gjør |
|---|---|
| Eksportinnhold | Les gjennom hele eksporten for personopplysninger, saksnære eksempler, helseopplysninger og små segmenter. |
| Kilder | Kilder skal være `widgetId`, `muralWidgetId` eller sanitert kildeoppsummering, ikke rå Mural-innhold. |
| Fritekst | Fritekstfelt skal være generiske og redaksjonelle. Ingen enkeltsaker eller forklaringer fra faktiske personer. |
| Måling | Eksporten skal skille eksisterende data, ny instrumentering og survey. Ny måling med persondata krever egen vurdering. |
| Stoppkriterier | Åpne røde funn skal enten være løst, parkert med begrunnelse eller eskalert før godkjenning. |

**Hvis sjekken feiler:** Ikke eksporter eller godkjenn. Fjern innholdet fra
eksporten, slett feil data fra Studio hvis det er lagret, og eskaler ved mulig
avvik.

## 5. Hva teamet gjør ved funn

| Handling | Når brukes den |
|---|---|
| Avvis | Innholdet skal ikke inn i Studio, for eksempel rå Mural-data, saksnær tekst eller helseopplysninger. |
| Rediger/anonymiser | Innholdet kan brukes hvis det omskrives til konseptnivå uten identifiserbare detaljer. |
| Slett | Feil data er allerede lagret i lokal database, eksportfil eller arbeidsdokument og må fjernes. |
| Eskaler | Det kan være personopplysninger, helseopplysninger, avvik, ny behandling eller behov for juridisk/personvernvurdering. |

Ved mulig personopplysningsbrudd skal teamet stoppe deling, bevare nok
informasjon til intern håndtering og varsle sikkerhetschampion eller riktig
personvern-/sikkerhetskanal samme dag. Følg teamets og Navs etablerte
avviksrutine; ikke håndter mulig avvik som vanlig GitHub-oppgave. Ikke rydd bort
bevis på egen hånd hvis det kan være et avvik.

Når feil data slettes, bør teamet dokumentere hva som ble slettet, når det ble
slettet og hvor det lå. Hvis dataene kan ha vært lagret eller delt lenger enn
en kort arbeidsøkt, skal det vurderes som mulig avvik.

## 6. Roller og ansvar i MVP

| Rolle | Ansvar |
|---|---|
| Den som importerer | Gjennomfører stoppunkt før import og sørger for lokal, gitignored råfil. |
| Den som promoterer | Bekrefter kildekort, sanitert tekst og PII-vurdering før tiltakskandidat lages. |
| Den som eksporterer | Leser gjennom eksporten og stopper ved røde funn. |
| Beslutningseier | Godkjenner at tiltak eller tiltakspakke kan gå videre etter at stoppunktene er utført. |
| Sikkerhet/personvern/juridisk rolle | Rådgir eller stopper arbeid ved tvil, nye datakategorier eller mulig avvik. |

## 7. Kobling til videre arbeid

- #13 skal kreve PII-bekreftelse før promotering til tiltakskandidat.
- #14 skal kreve PII-bekreftelse før eksport av tiltakspakke.
- Hvis Studio senere skal lagre fritekst, koble mot produksjonsdata eller gjøre
  ny instrumentering med persondata, må teamet ta ny sikkerhets- og
  personvernvurdering før implementering.
