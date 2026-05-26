# Lokal importflyt ende-til-ende

Denne oppskriften verifiserer den lokale grunnflyten:

```text
Postgres → migrasjoner → lokal auth-mock → import-API → widgets-API → inbox/matrix
```

## 1. Start lokal Postgres

```bash
pnpm db:up
```

Dette bruker `compose.yaml` og eksponerer Postgres på `localhost:5432`.
Kommandoen venter til databasen er healthy. Standardverdiene matcher
`.env.example`.

## 2. Sett miljøvariabler

Lag en lokal `.env` fra `.env.example`, eller eksporter verdiene i shellet:

```bash
cp .env.example .env
```

For lokal API-testing må auth-mocken være aktiv:

```bash
LOCAL_AUTH_MOCK_ENABLED=true
```

Mocken er opt-in og virker ikke i `NODE_ENV=production`.

## 3. Kjør migrasjoner

```bash
pnpm db:migrate
```

Hvis databasen skal nullstilles helt:

```bash
pnpm db:reset
```

## 4. Start appen

```bash
LOCAL_AUTH_MOCK_ENABLED=true pnpm dev
```

Appen kjører på <http://localhost:3000>.

## 5. Kjør smoke-test

I et nytt terminalvindu:

```bash
pnpm smoke:local-import
```

Smoke-testen:

1. sjekker at dev-serveren svarer
2. parser `fixtures/sanitized-mural-export.json`
3. poster dataminimert payload til `POST /api/projects/import`
4. henter widgets fra `GET /api/projects/:id/widgets`
5. skriver lenker til inbox og matrix

## Vanlige feil

### `DATABASE_URL mangler`

Sett `DATABASE_URL` i `.env` eller i shellet. Se `.env.example`.

### `Import-API-et svarte 401`

Dev-serveren er startet uten lokal auth-mock. Start på nytt med:

```bash
LOCAL_AUTH_MOCK_ENABLED=true pnpm dev
```

### `ECONNREFUSED` mot Postgres

Start databasen:

```bash
pnpm db:up
```

### Reimport gir `409`

UI-import av samme kildefil kan bare gjøres én gang per `sourceId`.
Smoke-testen bruker unik `sourceId` per kjøring for å unngå dette.
