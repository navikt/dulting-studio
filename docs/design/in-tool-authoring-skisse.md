# Skisse: in-tool authoring av tiltak (og koblinger)

**Status:** designskisse til sparring — IKKE besluttet eller bygd. Skrevet 2026-05-30.

## Hvorfor nå

Produktfokuset fremover er å **beslutte tiltakspakker** og **bearbeide/utforme gode
tiltak** (ikke flere store Mural-workshops — de er sjeldne). Det er authoring-arbeid.
I dag bor det strukturerte innholdet (tiltak med koblinger, brukerreiser, matrise,
utvelgelse) i **TypeScript-modeller** — kraftig og versjonert, men bare redigerbart av
en utvikler. For at «jobbe direkte i verktøyet» skal være ekte, må kjerne-innholdet
kunne opprettes og redigeres _i appen_, av ikke-utviklere.

## Gapet

| Hvor | Hva | Redigerbart i dag? |
|---|---|---|
| `src/lib/kidult-reference-model.ts`, `…-sykmeldt-reference-model.ts` | Bearbeidede tiltak (T01–T14 / ST01–ST12) med barriere, motivasjon, dult, EAST/Fogg, FORGOOD, guardrail, måletegn | Nei (TS) |
| `src/lib/tiltakspakke-utvelgelse-model.ts` | effekt/innsats/tier/hypotese per tiltak | Nei (TS) — og dette er nettopp tallene teamet skal **kalibrere** |
| `src/db/schema.ts` → `interventionCandidates` | DB-tiltak: title, status, desiredBehavior, rationale, actorTrack, journeyStep, placementRole, PII, audit, versjon | Ja (DB), men **tynt** og **frakoblet** referansemodellene |

Kort sagt: DB-en har et tiltak-skall, men ikke de rike koblingene; TS-modellene har
koblingene, men er ikke redigerbare. In-tool authoring = å forene disse.

## Hva som bør kunne redigeres (prioritert mot fokuset)

1. **Tiltak (P1):** opprett/rediger med fulle felt — ønsket atferd, barriere, motivasjon,
   dult, EAST/Fogg, FORGOOD, guardrail, måletegn, kildekort, åpne spørsmål.
2. **Utvelgelses-kalibrering (P1):** effekt, innsats, tier, hypotese (H1/H2), blokkert-flagg
   — slik at utvelgelses-matrisen blir teamets, ikke et utkast. Dette er den raskeste,
   mest etterspurte gevinsten.
3. **Koblinger/klynger (P2):** flytte tiltak mellom klynger/steg, knytte til brukerreisesteg.
4. **Brukerreise-steg (P3):** senere — reisene er mer «ferdige» og presentasjons-kritiske.

## Tre tilnærminger

### A. DB som sannhet (mest komplett)
Utvid `interventionCandidates` med de rike feltene (barriere, motivasjon, eastFogg,
forgood, guardrail, måletegn, effekt, innsats, tier, hypotese), bygg full CRUD-UI, og la
referanse-/utvelgelses-visningene **lese fra DB** i stedet for TS.
- ➕ Én sannhet, flerbruker, persistent, sporbar (audit/versjon finnes allerede).
- ➖ Krever DB provisjonert i prod (path b i `docs/deploy.md`), drizzle-migrering, og en
  refaktor av visningene fra TS→DB. Størst, mest risiko før tirsdag.

### B. Fokusert tiltak-editor (DB-backed, additiv)
Ny authoring-flate kun for tiltak + kalibrering, persistert i DB, eksporterbar. Demo-/
referansevisningene blir på TS inntil videre (migreres gradvis).
- ➕ Treffer fokuset (bearbeide tiltak + kalibrere pakke) uten å rive opp demoen.
- ➖ Midlertidig to kilder (TS-demo + DB-authoring) til migrering er gjort. Krever DB.

### C. Draft-editor uten DB (raskest, null infra)
Klientside-editor: rediger tiltak/kalibrering i appen, lagre i `localStorage`, **eksporter
JSON** (som limes inn i TS i dag, eller importeres til DB senere). Read-modellen er fortsatt
TS; editoren produserer en «overstyrings-/utkast»-fil.
- ➕ Null DB-avhengighet, byggbar og fullverifiserbar nå, trygt før tirsdag. Lar deg
  faktisk kalibrere effekt/innsats og justere tiltak i nettleseren med en gang.
- ➖ Énbruker, ikke delt/persistent på server; eksport-steget er manuelt.

## Anbefaling

**Faseinndelt:**
1. **Nå (C):** bygg en liten, DB-fri kalibrerings-/draft-editor for utvelgelsen — effekt/
   innsats/tier/hypotese + tiltak-tekst — med JSON-eksport. Det unblocker den faktiske
   jobben (kalibrere pakke 1, finpusse tiltak) uten DB-risiko, og gir umiddelbar «jobb
   direkte her»-verdi.
2. **Når DB provisjoneres (B → A):** flytt authoring til DB (`interventionCandidates`
   utvidet), la visningene lese derfra, og gjør det flerbruker/persistent. Da er
   verktøyet sannheten, og Mural blir kun for nye divergente workshops.

## Beslutninger som er dine

- **DB nå eller ikke?** A/B krever Cloud SQL (path b i `docs/deploy.md`). C unngår det.
- **Hvem skal redigere?** Bare deg/PL, eller hele teamet (påvirker auth + DB-behov).
- **Scope først:** kun tiltak + kalibrering (anbefalt), eller også brukerreise-steg?

Si fra hvilken tilnærming, så bygger jeg. C kan stå ferdig og verifisert raskt; A/B venter
på DB-beslutningen.
