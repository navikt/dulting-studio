# Skjema for dulting-redaktør

Skillen skal bruke dette skjemaet som konseptuell kontrakt. Felt kan utelates
når de er ukjente, men usikkerhet skal markeres eksplisitt.

## Bearbeidet item

```json
{
  "source": {
    "sourceId": "mural-widget-id eller studio-item-id",
    "originalText": "original lappetekst, kun hvis ingen synlig PII-/saksnær risiko",
    "sourceContext": "gruppe, farge, posisjon, lane eller annen kjent kontekst"
  },
  "classification": {
    "itemType": "problem | motivasjon | barriere | tiltak | måling | parkering | oppsummering | kommentar",
    "actorTrack": "arbeidsgiver | sykmeldt | begge | ukjent",
    "journeyStep": "tekst eller ukjent",
    "lane": "faktisk Mural-lane hvis kjent",
    "confidence": "høy | middels | lav"
  },
  "edited": {
    "title": "kort og handlingsrettet tittel",
    "summary": "kort bearbeidet tekst",
    "desiredBehavior": "hva vi ønsker at aktøren skal gjøre",
    "hypothesis": "hvis vi gjør X, forventer vi Y fordi Z",
    "knowledgeGaps": ["hva må avklares"],
    "nextQuestion": "viktigste spørsmål til teamet"
  },
  "behavioralAnalysis": {
    "east": {
      "easy": "relevant vurdering eller ukjent",
      "attractive": "relevant vurdering eller ukjent",
      "social": "relevant vurdering eller ukjent",
      "timely": "relevant vurdering eller ukjent"
    },
    "fogg": {
      "motivation": "motivasjon/barriere",
      "ability": "evne/friksjon",
      "prompt": "trigger/timing"
    },
    "forgoodFlags": {
      "fairness": "flag eller ingen kjent risiko",
      "openness": "flag eller ingen kjent risiko",
      "respect": "flag eller ingen kjent risiko",
      "goals": "flag eller ingen kjent risiko",
      "opinions": "flag eller ingen kjent risiko",
      "options": "flag eller ingen kjent risiko",
      "delegation": "flag eller ingen kjent risiko"
    }
  },
  "piiReview": {
    "risk": "ingen synlig | mulig | sannsynlig",
    "reason": "kort begrunnelse",
    "action": "behold | avvis | eskaler"
  },
  "statusSuggestion": "uklassifisert | foreslått | trenger-avklaring | parkert | forkastet"
}
```

Ved `piiReview.risk = mulig | sannsynlig` skal output ikke gjengi
originalteksten ordrett. Bruk `sourceId`, kort risikobegrunnelse og anbefalt
manuell håndtering.

## Klyngeforslag

```json
{
  "clusterTitle": "kort navn",
  "commonTheme": "hva kildene ser ut til å handle om",
  "sourceItems": [
    {
      "sourceId": "kilde-id",
      "excerpt": "kort utdrag, ikke ordrett ved PII-risiko",
      "itemType": "tiltak | barriere | motivasjon | måling | annet"
    }
  ],
  "similarityReason": "hvorfor disse hører sammen",
  "overlapOrConflict": "duplikat, overlapp, motstrid eller ukjent",
  "candidateCanonicalMeasure": "mulig tiltakskandidat, ikke beslutning",
  "coverage": {
    "actorTracks": "hva klyngen ser ut til å treffe / hva mangler",
    "journeySteps": "hva klyngen ser ut til å treffe / hva mangler"
  },
  "confidence": "høy | middels | lav",
  "openQuestions": ["må avklares før tiltak eller pakke"],
  "piiRiskSummary": "ingen synlig | mulig | sannsynlig"
}
```

Klynger er forarbeid. De er ikke tiltakspakker før teamet har valgt mål,
avgrensning og hvilke tiltak som faktisk skal inngå.

## Tillatte statusord

- `uklassifisert`
- `foreslått`
- `trenger-avklaring`
- `parkert`
- `forkastet`
- `tiltakskandidat`
