# Deploy og database-beslutning

Kort driftsnotat for å få dulting-studio ut i prod (rent prod-verktøy, ingen
dev), og den ene beslutningen som gjenstår på sikt: **skal appen ha database?**

> Plattformgrunnmuren (Azure AD, Wonderwall, helse-endepunkter, app-side
> tokenvalidering) er beskrevet i [README → Plattformgrunnmur](../README.md#plattformgrunnmur).
> Dette notatet dekker selve utrullingen og DB-valget.

## Hvordan deploy skjer i dag

Alt er allerede satt opp for NAIS — som en vanlig intern team-esyfo-app, på
linje med våre andre apper:

| Ting | Verdi |
| --- | --- |
| NAIS-app | `dulting-studio` i namespace `team-esyfo` |
| Cluster | `prod-gcp` (rent prod — ingen dev) |
| Manifest | `nais/nais-prod.yaml` (image settes via `{{image}}`) |
| Ingress | `https://dulting-studio.intern.nav.no` (intern — Nav-ansatte på Nav-nett) |
| Auth | Azure AD-app + Wonderwall-sidecar (`autoLogin: true`). `allowAllUsers: true` → **åpent for alle innloggede Nav-ansatte** (lås til team-esyfo-gruppe senere — se manifest) |
| Image | Next.js standalone, `node:24-slim`, port 3000 (`Dockerfile`) |
| Helse | `/api/isAlive`, `/api/isReady`, `/api/metrics` — statiske, ingen DB |

Utrulling går via `.github/workflows/build-and-deploy.yaml`:

1. **push til `main`** (eller PR) → jobben `test-and-verify` kjører
   `pnpm run lint`, `pnpm run test`, `pnpm run build`. **Alt må være grønt** —
   ellers bygges/deployes ingenting.
2. `build-prod` bygger image (team-esyfo reusable action).
3. `deploy-prod` kjører `nais/deploy` mot `prod-gcp` med
   `RESOURCE: nais/nais-prod.yaml`.

Så for å få noe ut: **merge til `main`** og push (push er den manuelle review-gaten).

> **Merk (fikset 2026-05-29):** `pnpm run lint` (Biome 2.2.0) feilet på allerede
> innsjekket kode → deploy-gaten var rød. Det er nå ryddet (format-sweep + Biome
> ignorerer genererte `migrations/` og `.github/skills/`). Se egen commit.

## Hva som virker uten database

Manifestet provisjonerer **ingen database**. Disse sidene er likevel fullt
funksjonelle deployet, fordi de er statiske eller filbaserte:

- **`/brukerreise/leder`** — apple-level-brukerreisen for nærmeste leder
  (+ `?modus=presentasjon`). DB-fri, delbar URL, lenket fra forsiden.
- `/` (forsiden) — `loadStudioCaseBundle` leser seed-filer, ikke DB.
- `/brukerreise`, `/brukerreise/aid-presentasjon`, `/tiltakskart`.

Dette er nok til å vise konkurranse-artefakten (brukerreisen) til alle
innloggede Nav-ansatte, allerede ved neste merge til main.

## Hva som trenger database

Studio-pipelinen leser/skriver Postgres via `getDb()` (`src/db/client.ts`,
`process.env.DATABASE_URL`):

- `/projects` (prosjektliste) og alt under `/projects/[id]/*`
- alle `/api/projects/*`-endepunkter (import, widgets, triage, klynger,
  tiltakskandidater, tiltakspakke, eksport)

Uten `DATABASE_URL` kaster `getDb()` («DATABASE_URL mangler»), og disse sidene
feiler deployet. (Lokalt var feilen du så Azure-auth, ikke DB — men deployet bak
Wonderwall er det DB-en som mangler.)

## Beslutningen: DB eller ikke

### (a) Deploy uten database — anbefalt nå
Brukerreisen + forsiden + referansevisningene er live og delbare. Studio-
pipelinen feiler til DB er på plass. Raskest vei til at artefakten er
tilgjengelig for alle før tirsdag. **Ingen kostnad, ingen ekstra ops.**

### (b) Full studio — legg til Cloud SQL Postgres
Gjør inbox/tiltak/klynger/matrise/tiltakspakke/import ende-til-ende. Koster en
Cloud SQL-instans i team-esyfo sitt GCP-prosjekt og litt drift → **ditt valg**
(jeg har ikke provisjonert noe).

Skisse til manifest-tillegg (`nais/nais-prod.yaml`):

```yaml
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_15
        tier: db-f1-micro        # minste tier; vurder større for prod
        databases:
          - name: dulting-studio
```

Gjenstående wiring når (b) velges (egen liten oppgave):

1. **`DATABASE_URL`:** NAIS injiserer
   `NAIS_DATABASE_DULTING_STUDIO_DULTING_STUDIO_URL` (+ `_USERNAME`/`_PASSWORD`/
   `_HOST` …). Enten les denne i `getDb()` (fallback-kjede
   `DATABASE_URL ?? NAIS_DATABASE_…_URL`) eller map den i oppstart.
2. **Migrering:** `migrations/` kjøres med `drizzle-kit migrate`. Kjør enten ved
   app-oppstart eller som egen `Naisjob` før deploy.
3. **Seed:** kun illustrative seed-data — aldri Mural-/persondata (se README →
   Datagrenser).
4. **accessPolicy/observability:** uendret; Cloud SQL går via sidecar-proxy.

> Konkret neste steg for (b): speil Cloud SQL-mønsteret fra en eksisterende
> team-esyfo-app som allerede har `gcp.sqlInstances`, så vi treffer tier,
> backup og flags likt teamet ellers.

## Hvem ser appen

`intern.nav.no` + `allowAllUsers: true` betyr: **alle innloggede Nav-ansatte** på
Nav-nett ser appen (Wonderwall krever fortsatt innlogging, men ingen
gruppe-begrensning). Vil du **låse til team-esyfo** senere: sett
`allowAllUsers: false` og legg team-esyfo sin AD-gruppe-ID under `claims.groups`
i `nais/nais-prod.yaml` (kommentert mal ligger i manifestet; hold i sync med en
ev. app-side `requiredAzureAdGroups`).

## DB-utrulling — implementert og klar (2026-05-30)

Path (b) er nå bygd og verifisert lokalt for den team-delte tiltak-editoren
(`/tiltakspakke-utvelgelse/rediger`). Tenant er `nav.no` (ikke trygdeetaten;
Z-identer støttes ikke). Klart å rulle ut — **ingen ekstra manuelle steg utover
deploy**, fordi migrering kjører på app-oppstart:

- **`nais/nais-prod.yaml`:** `gcp.sqlInstances` (POSTGRES_18, `db-f1-micro` =
  minste tier, `diskAutoresize: true`, `envVarPrefix: DB`) +
  `azure.application.claims.extra: [NAVident]`
  (NAV-ident i token → «sist endret av» i editoren).
- **`src/db/client.ts`:** `getDb()` bygger connection-string fra
  `DATABASE_URL ?? DB_URL ?? DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE`.
- **`src/instrumentation.ts`:** migrate-on-boot via drizzle-orm-migratoren,
  serialisert med `pg_try_advisory_lock` (ADR-003: ett kontrollert steg; appen
  kjører dessuten på 1 replica). Guardet i try/catch — en DB-feil hindrer
  ALDRI at appen starter (forsiden/brukerreisene er DB-frie og lazy).
- **`Dockerfile`:** `COPY migrations /app/migrations` (migratoren leser dem on-boot).

**Slik ruller du ut + verifiserer (på Nav-nett):**

1. Push til `main` (eller merge PR). CI bygger + deployer; NAIS provisjonerer
   Cloud SQL (tar noen minutter første gang). Kan kreve at Cloud SQL aktiveres
   for team-esyfo i NAIS Console/GCP (samme type steg som repo-autoriseringen).
2. Når poden er oppe: sjekk loggen for `[migrate] migreringer kjørt` (eller
   `hopper over` hvis DB ikke er klar enda — da redeploy/restart).
3. Åpne `/tiltakspakke-utvelgelse/rediger` → 26 tiltak lazy-seedes; rediger +
   Lagre → «v… · sist: \<din NAV-ident\>».
4. Lås til team-esyfo-gruppe når ønskelig (se «Hvem ser appen» over).

**Lokal utvikling:** `pnpm db:up` (Rancher/docker), `.env` med
`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dulting_studio` +
`LOCAL_AUTH_MOCK_ENABLED=true`, `pnpm db:migrate`, `pnpm dev`.
