# ADR-003: Drizzle ORM og SQL-migrasjoner for MVP

**Dato:** 2026-05-25  
**Status:** Foreslått  
**Beslutningstakere:** Team eSyfo, med råd fra plattform og databasekompetanse ved behov

## Kontekst

Repoet er en Next.js-app med TypeScript. Neste fase kan innføre Postgres som arbeidsflate for prosjekt, import og videre redigering. Før vi bygger datalaget, må vi velge hvordan skjema, typer og migrasjoner skal forvaltes.

Valget må passe en liten MVP, men også tåle vanlig drift på Nais med Postgres, review av migrasjoner i pull request og enkel vedlikehold over tid.

## Beslutning

Vi har besluttet å bruke Drizzle ORM sammen med Drizzle Kit for MVP, med TypeScript-skjema i kodebasen og SQL-migrasjoner i repoet.

For migrasjoner betyr det:

- skjema defineres i TypeScript
- migrasjoner genereres som SQL-filer og sjekkes inn i git
- migrasjoner kjøres kontrollert i miljøene
- migrasjoner kjøres i ett kontrollert steg per deploy, ikke parallelt i flere app-instanser ved scaling
- vi bruker ikke `push` som hovedmønster i delte miljøer eller produksjon

Dette gir en enkel TypeScript-flyt i en Next.js-app, samtidig som SQL-en er synlig og kan vurderes i review.

## 3-perspektiv-review

### Arkitektur

Drizzle holder datatilgang tett på TypeScript-koden uten å introdusere et ekstra abstraksjonslag eller egen DSL for alt. Det passer godt i en liten fullstack-app der teamet vil ha tydelig kontroll over Postgres-skjemaet.

### Sikkerhet

SQL-migrasjoner i repoet gjør skjemaendringer synlige i review og reduserer risikoen for skjulte databasegrep. Uansett ORM skal queries være parameteriserte, og secrets skal fortsatt håndteres via Nais senere.

### Plattform

Drizzle Kit støtter genererte SQL-migrasjoner og en enkel CLI-flyt. Det passer bedre i denne TypeScript-stacken enn å innføre et ekstra Java-basert migrasjonsløp bare for å få migrasjoner.

## Alternativer vurdert

### Alternativ A: Drizzle ORM + Drizzle Kit (valgt)

**Beskrivelse:** TypeScript-skjema med Drizzle, genererte SQL-migrasjoner med Drizzle Kit, og kontrollert kjøring av migrasjoner i miljøene.

**Fordeler:**
- Passer godt med Next.js og TypeScript.
- God type-sikkerhet uten tung kodegenerering.
- SQL-migrasjoner blir sjekket inn og kan leses i pull request.
- Lavere oppstartskostnad enn å kombinere flere verktøy.

**Ulemper:**
- Teamet må være bevisst på å velge `generate` + SQL som kan vurderes i pull request, ikke snarveier som passer bedre for prototyping enn drift.
- Mindre utbredt i Nav enn klassiske Java-oppsett med Flyway.

### Alternativ B: Prisma

**Beskrivelse:** Prisma-skjema som kilde i kodebasen, generert klient og migrasjoner via Prisma Migrate.

**Fordeler:**
- Modent økosystem og mye dokumentasjon.
- God utvikleropplevelse for CRUD og generert klient.
- SQL-migrasjoner kan sjekkes inn i repoet.

**Ulemper:**
- Tyngre verktøykjede enn vi trenger i MVP.
- Shadow database og genereringsflyt gjør migrasjonsløpet mer komplekst.
- Kan skape større avstand til Postgres-spesifikke valg og SQL-review enn ønskelig.

### Alternativ C: Kysely + Flyway

**Beskrivelse:** Kysely for queries og typer i appen, Flyway for migrasjoner.

**Fordeler:**
- Gir tydelig SQL-kontroll i migrasjonene.
- Flyway er et velkjent og robust migrasjonsmønster.
- Kysely er lett og type-sikkert for queries.

**Ulemper:**
- To separate verktøy å sette opp og drifte.
- Flyway gir ekstra operativ kompleksitet i en ellers ren TypeScript-stack.
- Høyere startkostnad enn nødvendig for MVP.

### Alternativ D: Gjøre ingenting

**Beskrivelse:** Utsette valg av ORM og migrasjonsstrategi til databasen faktisk bygges.

**Fordeler:**
- Ingen beslutningskostnad nå.

**Ulemper:**
- Skyver et grunnleggende arkitekturvalg til midt i implementasjonen.
- Øker risikoen for at teamet velger raskeste løsning i stedet for en konsistent løsning.

## Nav-spesifikke vurderinger

### Sikkerhet og personvern

- **Dataklassifisering:** Postgres vil i MVP være en intern arbeidsflate. Dataminimering fra ADR-002 gjelder fortsatt.
- **Auth-mekanisme:** Ingen endring. Azure AD for appen når den senere får database.
- **PII-håndtering:** ORM-valget endrer ikke datagrensene. Vi skal fortsatt ikke lagre rå Mural-eksport eller unødige identifikatorer.
- **Tilgangsstyring:** Database nås bare av appen. Ingen delt database eller direkte tilgang for andre team.
- **Personvern:** Migrasjoner skal være synlige i pull request og ikke smyge inn nye datafelt uten eksplisitt vurdering.

### Plattform (Nais/GCP)

- **Infrastrukturkrav:** Når database innføres, er Cloud SQL for Postgres via Nais standardvalget.
- **Ressursbehov:** Lite for MVP. Unngå unødig tung verktøykjede i build og deploy.
- **Observerbarhet:** Egne tekniske metrikker for migrasjonsutfall og databasefeil når databasen kommer. Ingen logging av SQL-parametre med innhold.
- **CI/CD-endringer:** Migrasjoner skal ligge i repoet og kjøres kontrollert som del av deployløpet. Kjøringen må skje som ett kontrollert steg, slik at flere replikaer ikke prøver å kjøre samme migrasjon parallelt. Ingen hemmeligheter eller konkret DB-konfig i dokumentasjonen.

### Team og organisasjon

- **Berørte team:** Team eSyfo. Plattform involveres når Cloud SQL og deployløp settes opp.
- **Architecture Advice:** Ikke behov for tung prosess, men valget bør være synlig før datalaget bygges.
- **Migrasjonsstrategi:** Start med Drizzle fra første tabell. Unngå å blande ORM-er.
- **Tilbakerulling:** Vanlig rollback med ny migrasjon eller kontrollert revert. Ingen håndredigering i produksjon.
- **Tidsramme:** Før første databaseimplementasjon.

## Konsekvenser

### Positive

- Enkel og konsistent TypeScript-flyt i repoet.
- Synlige SQL-migrasjoner i review.
- Lavere oppstartskostnad enn mer sammensatte alternativer.

### Negative

- Teamet må være disiplinert på migrasjonspraksis.
- Valget er mindre standardisert enn et Flyway-oppsett i JVM-miljø.

### Risiko

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|--------|--------------|------------|-----------|
| Teamet bruker `push` i stedet for reviewbare migrasjoner | Middels | Middels | Avklar arbeidsflyt tidlig og dokumenter `generate` + innsjekk av SQL |
| ORM-valget skjuler Postgres-spesifikke behov | Lav | Middels | Behold SQL-migrasjoner og bruk eksplisitt SQL når det trengs |
| Sen innføring av database gir blandet verktøystack | Middels | Middels | Lås ett ORM-valg før første tabell bygges |

## Aksjonspunkter

- [ ] Dokumenter standard arbeidsflyt for skjemaendring og migrasjon — teamet — før første database-PR
- [ ] Velg mappeplassering for skjema og migrasjoner i repoet — teamet — før implementasjon
- [ ] Definer hvordan migrasjoner kjøres i dev og deploy, inkludert ett kontrollert migrasjonssteg per deploy — teamet — før Cloud SQL settes opp
- [ ] Hold ORM-valget samlet og unngå parallell innføring av Prisma eller Kysely — teamet — løpende
