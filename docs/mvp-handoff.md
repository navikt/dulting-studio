# Dulting Studio MVP-handoff

Dette dokumentet samler status etter første vertikalslice, slik at videre arbeid
kan skje i `navikt/dulting-studio` uten å være avhengig av session-notater fra
`syfo-oppfolgingsplan-frontend`.

## Nåværende status

- Repoet har Next.js-app, Aksel UI, NAIS dev-manifest og GitHub workflow.
- Appen har dataminimert Mural-import fra lokal JSON-fil.
- Rå Mural JSON skal ikke lagres i repoet, database eller serverlogger.
- Importen parser i nettleser og sender bare en allowlistet DTO til API-et.
- API-ruter er beskyttet med Azure/Oasis-wrapper og same-origin-sjekk.
- Lokal utvikling kan bruke eksplisitt auth-mock med `LOCAL_AUTH_MOCK_ENABLED=true`.
- Datamodellen har Postgres/Drizzle-migrasjoner for prosjekter, importer,
  widgets og klassifiseringer.
- Første UI-slice dekker prosjektimport, inbox-tabell, klassifiseringspanel og
  brukerreisematrise.

## Lokale Mural-artefakter

Reell Mural-eksport og analyser kan ligge lokalt under:

```text
local-mural-exports/
```

Denne mappen er gitignored. Den kan inneholde:

- `mural-widgets-response.json`
- `mural-content-response.json`
- `mural-overview.png`
- `analysis/mural_text_widgets.csv`
- `analysis/mural_text_sorted.md`
- `analysis/mural_headings_and_short_texts.md`

Ikke commit filer herfra uten eksplisitt sanitering og review. Repoet skal bare
ha syntetiske eller saniterte fixtures under `fixtures/`.

## Viktige produktbeslutninger

- Første produkt må støtte import og bearbeiding av faktisk Mural-volum.
- Muralen er ikke bare en flat lappeliste. Den uttrykker brukerreise,
  aktørspor, workshop-grupper, problemområder/analyse, tiltak, målinger,
  parkering og oppsummeringer.
- MVP skal støtte minst to aktørspor: arbeidsgiver/nærmeste leder og
  arbeidstaker/sykmeldt.
- Tabell/inbox er primærvisning for rå import og triage.
- Bearbeidede tiltak og tiltakspakker bør få mer kuraterte kort-/gruppevisninger.
- Tiltakspakker kan inneholde mange tiltak. Det skal ikke være en hard maksgrense.
- FORGOOD brukes som kvalitative refleksjoner/flagg, ikke totalscore.
- EAST og Fogg brukes som diagnostikk, ikke poengmodell.
- Teamet kan godkjenne tiltakspakker i MVP, med manuelle PII-stoppunkter.
- `.github/skills/dulting-redaktor/` kan brukes som bearbeidingsmotor både for
  Mural-first arbeid og for Studio inbox-items.

## Kildekart for tiltakssporet

Se [`docs/dulting-kildekart.md`](dulting-kildekart.md) for forklaring av
`DULT-*` og `TK-*` kilde-IDer som brukes i Mural og arbeidsfiler.

## Neste anbefalte issues

1. Bruk `docs/local-import-e2e.md` for å verifisere lokal import med Postgres,
   migrasjoner og auth-mock.
2. Lag prosjektoversikt for importerte Mural-brett.
3. Forbedre Mural-mapping til aktørspor, brukerreisesteg, lanes og
   workshop-grupper.
4. Gjør inboxen bedre for store datasett: foreldreløse items, side-ved-side
   gruppevisning og tydelig batcharbeid.
5. Promoter inbox-items til kanoniske tiltak.
6. Bygg tiltakspakkevisning med dekning på aktørspor og brukerreisesteg.
7. Eksporter godkjent tiltakspakke til Markdown/JSON etter PII-bekreftelse.
8. Dokumenter manuelle PII-stoppunkter før import, promotering og eksport.

## Ikke flytt inn ennå

- Direkte Mural API, OAuth eller sync.
- Automatisk PII-deteksjon.
- Produksjonsdata eller saksnære eksempler.
- Dashboard, portefølje eller effektanalyse.
- Full workshop-canvas som erstatter Mural fra dag én.
