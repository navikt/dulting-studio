# ADR-002: Dataminimert Mural-import i MVP

**Dato:** 2026-05-25  
**Status:** Foreslått  
**Beslutningstakere:** Team eSyfo, med råd fra sikkerhet/personvern og berørte produkteiere

## Kontekst

Teamet skal importere en faktisk workshop-eksport fra Mural som grunnlag for første MVP. Materialet er stort og ujevnt strukturert, og rå eksport kan inneholde mer metadata enn vi trenger, for eksempel brukerreferanser, tidsstempler, låsestatus, integrasjonsmetadata og URL-er.

MVP-en skal være en intern arbeidsflate og beslutningsprotokoll, ikke et arkiv for rå Mural-data. Teamet vil ikke ha PII eller personsaker inn med vilje, men vi må legge inn tekniske guardrails som stopper overinnsamling også ved direkte API-kall.

## Beslutning

Vi har besluttet at rå Mural JSON ikke skal lagres i database, på server eller i repoet.

Importen skal skje slik:

1. Rå eksportfil leses lokalt i nettleseren.
2. Klienten transformerer eksporten til en dataminimert DTO.
3. Kun DTO-en sendes til import-API-et.
4. API-et validerer payloaden mot en streng allowlist før lagring.

Vi lagrer bare felter som trengs for å rekonstruere arbeidsflaten og jobbe videre i Studio:

- `muralWidgetId`
- widget-type
- parent/child-relasjon
- row/column
- `x`, `y`, `width`, `height`
- `zIndex` når det faktisk trengs for visuell rekkefølge
- ren tekst
- original farge
- `importId` og `projectId`
- klassifisering som Studio setter
- app-genererte tags, noter og status
- `createdAt` og `updatedAt` i Studio

Vi lagrer ikke:

- `owner`, `lastUpdateBy`, `lastContentEditedBy`
- Mural-brukeridentifikatorer og Mural-timestamps utover det som trengs i Studio
- `locked`, `lockedBy`
- voting sessions og tilsvarende workshop-metadata
- `thumbUrl`, download-URL-er og andre vedleggs- eller filreferanser
- tokens, session-data eller auth-relaterte felter
- Jira- eller annen integrasjonsmetadata
- rå HTML når ren tekst er nok

Import-API-et skal bruke server-side validering med strict allowlist. Ukjente felt skal avvises eller forkastes før persistering, slik at ingen direkte API-kall kan lagre Mural owner-data, brukerdata, tidsstempler, tokens eller andre ikke-godkjente felt. I MVP tillater vi ikke andre layout- eller metadatafelter enn listen over. Nye felter krever ny ADR eller eksplisitt oppdatering av importkontrakten.

Logging skal aldri inneholde tekstinnhold, rå payload eller Mural-brukeridentifikatorer. Logging skal bare dekke tekniske hendelser, for eksempel antall objekter, importstatus og valideringsfeil uten innholdsfelt.

Faktisk Mural-eksport skal ikke committes. Reell importfil skal være lokal og gitignored. I repoet kan vi bare ha sanitisert eller syntetisk fixture-data til test og utvikling.

Retensjon i MVP:

- soft delete på prosjekt og import
- manuell sletting i MVP
- før første produksjonsvurdering skal teamet beskrive hvem som sletter manuelt, hvilke data som omfattes og når sletting skal gjennomføres
- automatisk retensjon vurderes etter MVP når faktisk bruksbehov er kjent

## 3-perspektiv-review

### Arkitektur

Dataminimert import holder Mural som engangskilde og gjør Studio til kilden for videre arbeid. Det gir et tydeligere domenesnitt enn å lagre hele eksporten og prøve å rydde i etterkant.

### Sikkerhet

Rå Mural-eksport kan inneholde interne identifikatorer og annet innhold vi ikke skal lagre. Klienttransformasjon alene er ikke nok, derfor er server-side allowlist og logging uten innhold en del av selve beslutningen.

### Plattform

Løsningen krever ikke Mural API, OAuth eller sync i MVP. Det reduserer behov for secrets, outbound `accessPolicy` og driftskompleksitet.

## Alternativer vurdert

### Alternativ A: Lagre rå Mural JSON og filtrere senere

**Beskrivelse:** Lese inn hele eksporten og rense data i backend eller etter lagring.

**Fordeler:**
- Enkelt å komme raskt i gang med import.
- Gir full sporbarhet tilbake til råkilden.

**Ulemper:**
- Bryter dataminimering.
- Øker risiko for å lagre brukerdata, tidsstempler, URL-er og annet vi ikke trenger.
- Gjør logging, sletting og videre behandling vanskeligere.

### Alternativ B: Dataminimert DTO i klient + streng allowlist i API (valgt)

**Beskrivelse:** Nettleseren leser rå eksport lokalt, sender bare godkjente felter, og API-et godtar bare disse feltene.

**Fordeler:**
- Minimerer data fra første steg.
- Hindrer at direkte API-kall kan omgå klienten.
- Gjør sletting, logging og videre modellering enklere.
- Passer MVP uten ekstern integrasjon.

**Ulemper:**
- Krever tydelig importkontrakt og streng validering.
- Vi mister muligheten til å hente fram hele råkonteksten fra Studio senere.

### Alternativ C: Direkte Mural API eller sync

**Beskrivelse:** Koble Studio til Mural med API, OAuth eller periodisk synkronisering.

**Fordeler:**
- Mindre manuell filhåndtering.
- Kan gi bedre sporbarhet mot original workshop.

**Ulemper:**
- Utenfor MVP.
- Krever auth, secrets, outbound-tilgang og ny sikkerhetsvurdering.
- Øker risikoen for å hente inn flere data enn nødvendig.

### Alternativ D: Gjøre ingenting

**Beskrivelse:** Importere workshopinnhold uten fast dataminimeringsbeslutning.

**Fordeler:**
- Ingen oppstartskostnad i dokumentasjon.

**Ulemper:**
- Høy risiko for overinnsamling og feil lagring.
- Ulik praksis mellom utviklere og miljøer.
- Vanskeligere å få trygg personvernvurdering senere.

## Nav-spesifikke vurderinger

### Sikkerhet og personvern

- **Dataklassifisering:** Arbeidsflaten er intern. Rå eksport behandles som data vi skal minimere aggressivt fordi den kan inneholde interne identifikatorer og utilsiktet personrelatert innhold.
- **Auth-mekanisme:** Azure AD for intern arbeidsflate. Ingen Mural-auth i MVP.
- **PII-håndtering:** Ingen personopplysninger, brukeridentifikatorer eller saksnært tekstinnhold skal lagres med vilje. Hvis importfilen inneholder slikt, skal det stoppes av guardrails og manuell kontroll.
- **Tilgangsstyring:** Ingen ny outbound `accessPolicy` til Mural i MVP. Import skjer fra lokal fil i brukerens browser.
- **Personvern:** Dataminimering og sletting er dokumentert. Hvis teamet senere vil lagre rå eksport eller koble seg til Mural API, må vi ta ny ADR og vurdere DPIA.
- **Logging:** Bare strukturert teknisk logging uten tekstinnhold eller rå payload.

### Plattform (Nais/GCP)

- **Infrastrukturkrav:** Ingen nye plattformtjenester for selve importkilden i MVP.
- **Ressursbehov:** Import kan være stor, men behandles som vanlig apptrafikk. Vi skal ikke bruke serverlagring som mellomstasjon for råfil.
- **Observerbarhet:** Tellere for importforsøk, valideringsfeil og lagrede objekter. Ingen innholdslogging.
- **CI/CD-endringer:** Reell importfil skal ikke inn i repoet. Tester og demo bruker bare sanitiserte eller syntetiske fixtures.

### Team og organisasjon

- **Berørte team:** Team eSyfo, sikkerhet/personvern og eventuelt produkteiere som deltar i workshopen.
- **Architecture Advice:** Denne ADR-en bør deles før importendepunkt bygges.
- **Migrasjonsstrategi:** Gjelder fra første importimplementasjon.
- **Tilbakerulling:** Enkel. Hvis importen ikke er trygg nok, stoppes funksjonen uten å påvirke andre deler av appen.
- **Tidsramme:** Før bygg av importløpet.

## Konsekvenser

### Positive

- Mindre risiko for å samle inn og lagre feil data.
- Tydelig importkontrakt for frontend og backend.
- Enklere sletting, testdatahåndtering og review.

### Negative

- Krever mer eksplisitt modellering før import kan bygges.
- Rå Mural-kontekst er ikke tilgjengelig i Studio etter import.

### Risiko

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|--------|--------------|------------|-----------|
| Klienten sender flere felt enn avtalt | Middels | Høy | Strengt skjema på serveren og avvisning av ukjente felt |
| Reell importfil havner i git | Lav | Høy | Gitignore, README-regler og bare syntetiske fixtures i repoet |
| Tekstinnhold havner i logger ved feil | Middels | Høy | Egne loggere for importfeil og forbud mot payload-logging |

## Aksjonspunkter

- [ ] Definer import-DTO og allowlist før implementasjon — teamet — før Fase 1
- [ ] Legg inn gitignore-regel og lokal arbeidsrutine for reell importfil — teamet — før første importtest
- [ ] Dokumenter sletting og soft delete i datamodellen — teamet — før databasearbeid
- [ ] Beskriv manuell sletterutine for prosjekt og import før første produksjonsvurdering — teamet — før prod-vurdering
- [ ] Avklar om importfeil trenger egen metrikk og alert — teamet — før dev-deploy
