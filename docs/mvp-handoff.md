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
- Datamodellen har nå også `clusters` og `cluster_memberships` for å samle flere
  widgets i en redaksjonell Studio-klynge.
- API-et har første slice for å liste, opprette og hente klynger med sporbare
  kildewidgets.
- UI-et har første minimale flyt for å velge widgets, opprette klynge og se
  klyngeliste.

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
- Muralen uttrykker mer enn en flat lappeliste: brukerreise,
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

## Tiltaksregister for dulting-raden

Se [`docs/dulting-tiltaksregister.md`](dulting-tiltaksregister.md) for råkort,
intensjon, tiltaksklynge, status og mapping for DULT-kortene.

## Nåværende redaksjonsmodell i første slice

Første slice i Studio avgrenser tydelig mellom rå import, redaksjonell
bearbeiding og senere tiltakarbeid:

Se også [`.github/skills/dulting-redaktor/SCHEMA.md`](../.github/skills/dulting-redaktor/SCHEMA.md)
og [`.github/skills/dulting-redaktor/EXAMPLES.md`](../.github/skills/dulting-redaktor/EXAMPLES.md)
for skjema og konkrete eksempler på den samme modellen.

- **Rå widget** er en dataminimert importert Mural-lapp/widget med sporbar kilde
  via `muralWidgetId`. Rå Mural JSON skal fortsatt ikke lagres i repo, database
  eller serverlogger.
- **Studio-klynge** er første lagrede redaksjonelle nivå i Studio. Den samler
  flere widgets og består av navn, valgfritt sanitert sammendrag, status
  (`draft`/`validated`) og medlemskap. Klyngen er forarbeid og sporbarhet, ikke
  et tiltak.
- **Tiltakskandidat** er et senere bearbeidet forslag med ønsket atferd,
  hypotese, FORGOOD/EAST/Fogg og måletegn. Dette er ikke del av første slice fra
  issue #18-#20.
- **Tiltakspakke** er en senere kuratert pakke med tiltakskandidater og
  beslutningsgrunnlag. Dette er ikke del av første slice.
- **Målinger** holdes også avgrenset: rå målelapper kan importeres og knyttes
  til spørsmål eller indikasjoner, men validerte måletegn hører til
  tiltakskandidater, ikke rå widgets eller klynger.

Klynger skal derfor ikke ha FORGOOD/EAST/Fogg-score eller målescore i første
slice.

## Arbeidsflyt i første slice

Se [`.github/skills/dulting-redaktor/SCHEMA.md`](../.github/skills/dulting-redaktor/SCHEMA.md)
og [`.github/skills/dulting-redaktor/EXAMPLES.md`](../.github/skills/dulting-redaktor/EXAMPLES.md)
for detaljert arbeidsflyt, output-format og eksempler.

1. Importer Mural lokalt med dataminimert DTO. Rå Mural JSON skal ikke lagres.
2. Jobb i Mural og/eller Studio-inboxen for å rydde, klassifisere og finne
   overlapp.
3. Når flere widgets hører sammen, opprett en **Studio-klynge** med navn,
   valgfritt sanitert sammendrag og medlemskap til widgets.
4. Hold Mural-output lett med kildehenvisninger som `W12, W18`.
5. Hvis teamet senere vil løfte klyngen videre, formuler tiltakskandidat,
   måletegn og eventuelt tiltakspakke som egne senere artefakter.

Full historikk og beslutningslogg er fortsatt utenfor første slice. Det krever
eksplisitt opt-in og/eller senere Studio-støtte.

## Neste anbefalte issues

1. Bruk `docs/local-import-e2e.md` for å verifisere lokal import med Postgres,
   migrasjoner og auth-mock.
2. Lag prosjektoversikt for importerte Mural-brett.
3. Forbedre Mural-mapping til aktørspor, brukerreisesteg, lanes og
   workshop-grupper.
4. Gjør inboxen bedre for store datasett: foreldreløse items, side-ved-side
   gruppevisning og tydelig batcharbeid.
5. Bearbeid validerte Studio-klynger videre til tiltakskandidater med ønsket
   atferd, hypotese, FORGOOD/EAST/Fogg og måletegn.
6. Bygg visning for tiltakskandidater og tiltakspakker med dekning på
   aktørspor og brukerreisesteg.
7. Eksporter godkjent tiltakspakke til Markdown/JSON etter PII-bekreftelse.
8. Dokumenter manuelle PII-stoppunkter før import, promotering og eksport.

## Ikke flytt inn ennå

- Direkte Mural API, OAuth eller sync.
- Automatisk PII-deteksjon.
- Produksjonsdata eller saksnære eksempler.
- Dashboard, portefølje eller effektanalyse.
- Full workshop-canvas som erstatter Mural fra dag én.
