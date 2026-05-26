# Skjema for dulting-redaktør

Skillen skal bruke dette skjemaet som konseptuell kontrakt. Felt kan utelates
når de er ukjente, men usikkerhet skal markeres eksplisitt.

## Bearbeidet item

```json
{
  "source": {
    "sourceId": "mural-widget-id eller studio-item-id",
    "originalText": "original lappetekst",
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
    "action": "behold | rediger | avvis | eskaler"
  },
  "statusSuggestion": "foreslått | trenger-avklaring | parkert | forkastet"
}
```

## Tiltakspakkeutkast

```json
{
  "packageTitle": "kort navn",
  "purpose": "hvilket mål pakken skal støtte",
  "includedMeasures": [
    {
      "title": "tiltak",
      "sourceIds": ["kilde-id"],
      "actorTracks": ["arbeidsgiver"],
      "journeySteps": ["uke 4"],
      "whyIncluded": "kort begrunnelse"
    }
  ],
  "coverage": {
    "actorTracks": "hva treffer pakken / hva mangler",
    "journeySteps": "hva treffer pakken / hva mangler"
  },
  "openQuestions": ["må avklares før beslutning"],
  "forgoodRisks": ["viktigste kvalitative flagg"],
  "piiStopPoint": "hva må sjekkes manuelt før eksport"
}
```

## Tillatte statusord

- `uklassifisert`
- `foreslått`
- `trenger-avklaring`
- `parkert`
- `forkastet`
- `i-tiltak`
- `i-tiltakspakke`
- `klar-for-review`

