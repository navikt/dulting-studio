# Filbasert datalag

`data/` er reservert for strukturert, versjonert innhold i MVP-en.

## Grenser

- Ingen persondata
- Ingen diagnosegrupper
- Ingen konkrete saker eller saksnære eksempler
- Ingen små eller sårbare segmenter
- Ingen produksjonsdata

## Retning

MVP-en bruker JSON for strukturert innhold. Valideringen ligger i
`src/lib/studio-data/` og håndhever:

- faste felter og enum-verdier
- kryssreferanser mellom case, tiltak og tiltakspakker
- tydelige feilmeldinger ved ugyldig struktur
- enkle tekstlige guardrails mot e-post, lange tallsekvenser og
  diagnose-/helsereferanser

## Struktur

```text
data/
  cases/
    oppfolgingsplan/
      case.json
      tiltak/
        *.json
      tiltakspakker/
        *.json
```

## Seed-data

Repoet inneholder illustrative seed-data for oppfølgingsplan. De er laget for å
teste modell, validering og tidlig UI — ikke for å beskrive reelle tiltak,
workshopfunn eller konkrete brukerhistorier.

## Trygg arbeidsflyt for nye tiltak

1. Kopier strukturen fra eksisterende JSON-filer.
2. Hold deg til konseptnivå: problem, hypotese, måling og vurdering.
3. Ikke legg inn Mural-utdrag, rå workshopnotater eller produksjonsnære
   beskrivelser.
4. Kjør `pnpm validate:data` for datalaget.
5. Kjør deretter `pnpm check`, `pnpm test` og `pnpm build`.
