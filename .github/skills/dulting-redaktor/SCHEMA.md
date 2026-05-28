# Skjema for dulting-redaktør

Skillen skal bruke dette skjemaet som konseptuell kontrakt. Felt kan utelates
når de er ukjente, men usikkerhet skal markeres eksplisitt.

## Redaksjonell modell i første slice

- **Rå widget:** dataminimert importert Mural-lapp/widget med sporbar kilde via
  `muralWidgetId`. Rå Mural JSON skal ikke lagres.
- **Studio-klynge:** første lagrede redaksjonelle nivå i Studio. Den samler flere
  widgets og består av `name`, valgfri sanitert `summary`, `status`
  (`draft`/`validated`) og medlemskap. Klynger er forarbeid og sporbarhet, ikke
  tiltak.
- **Tiltakskandidat:** senere bearbeidet forslag med ønsket atferd, hypotese,
  FORGOOD/EAST/Fogg og måletegn. Ikke del av første slice.
- **Tiltakspakke:** senere kuratert pakke med tiltakskandidater og
  beslutningsgrunnlag. Ikke del av første slice.
- **Målinger:** rå målelapper kan fanges og knyttes som spørsmål eller
  indikasjoner, men validerte måletegn hører til tiltakskandidater, ikke rå
  widgets eller Studio-klynger.

## Studio-klynge som output fra interaktiv fasilitering

Når fasiliteringen skal ende i noe Studio faktisk kan lagre i første slice, er
outputen et forslag til opprettelse av en Studio-klynge:

```json
{
  "studioCreate": {
    "name": "kort klyngenavn",
    "summary": "valgfri sanitert oppsummering eller null",
    "widgetIds": ["uuid-1", "uuid-2"]
  },
  "muralOutput": {
    "sources": ["W12", "W18"]
  }
}
```

- `studioCreate` matcher opprettelse av klynge i første slice. Klient sender
  `name`, `summary` og `widgetIds`. Status settes til `draft` på serveren.
- `projectId` hentes fra URL- eller prosjektkonteksten i Studio. Det skal ikke
  ligge i `studioCreate`-bodyen.
- Etter lagring består en Studio-klynge av `id`, `name`, `summary`, `status` og
  widgets med sporbar `muralWidgetId`.
- Klynger skal **ikke** inneholde FORGOOD/EAST/Fogg-score, målescore eller full
  beslutningslogg.
- Full historikk og beslutningslogg er fortsatt utenfor første slice og krever
  senere Studio-støtte og/eller eksplisitt opt-in.

## Interaktiv fasilitering

```json
{
  "question": "ett spørsmål om gangen",
  "sources": [
    {
      "sourceId": "W12",
      "excerpt": "kort utdrag eller sanitert oppsummering"
    }
  ],
  "sourceRelation": "rene duplikater | tematisk overlapp | separate spor",
  "recommendedAnswer": "agentens anbefalte valg nå",
  "reason": "kort begrunnelse for anbefalingen",
  "choices": ["valg 1", "valg 2", "valg 3"],
  "clarifiesNow": "hva dette spørsmålet avklarer",
  "decisionLog": {
    "enabled": false,
    "entries": [
      {
        "type": "begrep | klyngebeslutning | åpent-spørsmål | målepremiss",
        "text": "sanitert notat"
      }
    ]
  },
  "piiReview": {
    "risk": "ingen synlig | mulig | sannsynlig",
    "reason": "kort begrunnelse",
    "action": "behold | avvis | eskaler"
  }
}
```

- `decisionLog` er valgfri og kun ved eksplisitt ja.
- Bruk kilde-IDer og sanitert oppsummering, ikke rå eller saksnær tekst.

## Bearbeidet item

Dette er et analytisk arbeidsformat for skillen. Det er ikke det samme som
lagret Studio-struktur i første slice.

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
  "coverage": {
    "actorTracks": "hva klyngen ser ut til å treffe / hva mangler",
    "journeySteps": "hva klyngen ser ut til å treffe / hva mangler"
  },
  "confidence": "høy | middels | lav",
  "openQuestions": ["må avklares før klyngen ev. blir tiltakskandidat"],
  "piiRiskSummary": "ingen synlig | mulig | sannsynlig"
}
```

Klynger er forarbeid. De er ikke tiltakskandidater eller tiltakspakker. FORGOOD,
EAST, Fogg og validerte måletegn hører til senere bearbeiding dersom teamet
velger å løfte klyngen videre.

## Tillatte statusord

For generell redaksjonell analyse kan skillen bruke disse statusordene:

- `uklassifisert`
- `foreslått`
- `trenger-avklaring`
- `parkert`
- `forkastet`
- `tiltakskandidat`

For lagret **Studio-klynge** i første slice gjelder bare `draft` og
`validated`.
