---
name: dulting-redaktor
description: Bearbeider Mural-lapper og Dulting Studio inbox-items til strukturerte innsikter, tiltakskandidater, klynger og åpne spørsmål. Brukes når bruker vil rydde, klassifisere, forbedre, finne overlapp eller gruppere workshop-/Mural-innhold med EAST, Fogg, FORGOOD og PII-stoppunkter.
---

# Dulting-redaktør

Bruk skillen som redaksjonell og analytisk motor for Dulting Studio. Den skal
fungere både når Mural er UI-et, og når materialet er importert til Studio.

## Når du skal bruke skillen

Bruk `/dulting-redaktor` når du skal:

- rydde og strukturere Mural-lapper
- klassifisere importerte inbox-items
- forbedre lappetekst uten å endre intensjonen
- foreslå aktørspor, brukerreisesteg, lane/type og status
- finne duplikater og forslag som bør slås sammen
- foreslå kandidater for kanoniske tiltak, med kilde og usikkerhet
- foreslå klynger, overlapp, hull i dekning og åpne spørsmål

## Prinsipper

1. **Bevar kilde og intensjon.** Ikke finn opp tiltak, datagrunnlag eller effekt.
2. **Gjør forslag operasjonelle.** Skriv ønsket atferd, hypotese og neste steg.
3. **Skill råmateriale fra bearbeiding.** Originaltekst skal være sporbar.
4. **Ikke score etikk.** FORGOOD er kvalitative flagg og refleksjoner.
5. **Stopp PII og saksnær tekst.** Marker risiko, ikke normaliser den bort.
6. **Tenk brukerreise.** Knytt funn til aktørspor og steg når det er mulig.
7. **Ikke pakk for tidlig.** Tiltakspakker krever eksplisitt mål og dialog.

## Arbeidsflyt

### 1. Forstå input

Identifiser om materialet er rå Mural-lapper, eksporterte Mural-tekster,
Studio inbox-items, allerede bearbeidede tiltak eller en mulig pakkeidé.

Hvis input mangler kontekst, kan du klassifisere og redigere med lav
konfidens. Ikke foreslå formål, prioritet, effekt eller pakker uten tydelig
kildegrunnlag.

### 2. Klassifiser

Klassifiser hvert item med:

- `itemType`: problem, motivasjon, barriere, tiltak, måling, parkering,
  oppsummering eller kommentar
- `actorTrack`: arbeidsgiver, sykmeldt, begge eller ukjent
- `journeyStep`: kjent steg eller ukjent
- `lane`: faktisk Mural-lane hvis kjent
- `status`: uklassifisert, foreslått, trenger-avklaring, parkert eller forkastet

### 3. Rediger

For hvert item:

- skriv en kortere og tydeligere tittel
- bevar originaltekst som kilde når den ikke har PII-/saksnær risiko
- formuler ønsket atferd hvis mulig
- formuler hypotese hvis mulig
- beskriv kunnskapshull og åpne spørsmål
- marker PII-/saksnær risiko

### 4. Vurder med atferdsmodeller

Bruk modellene lett:

- **EAST:** Easy, Attractive, Social, Timely
- **Fogg:** Motivation, Ability, Prompt
- **FORGOOD:** Fairness, Openness, Respect, Goals, Opinions, Options,
  Delegation

Ikke fyll alle felter med svak tekst. Skriv heller `ukjent` eller
`må avklares`.

### 5. Foreslå klynger og overlapp

Når flere items behandles:

- finn duplikater og overlapp
- foreslå klynger som kan bearbeides videre
- foreslå kandidater til kanoniske tiltak
- vis hull i dekning på aktørspor og brukerreisesteg
- marker tiltak som bør parkeres eller krever faglig avklaring

Ikke lag tiltakspakkeutkast med formål og avgrensning med mindre brukeren
eksplisitt ber om det og har gitt mål, utvalgte klynger og beslutningskontekst.

## Output

Velg format etter bruken:

- **Mural-first:** kort Markdown som kan limes tilbake i Mural
- **Studio-first:** strukturert JSON/Markdown som matcher inbox/tiltak
- **Batch:** klyngeforslag med kilder, overlapp, hull og PII-stoppunkt

Se [SCHEMA.md](SCHEMA.md) og [EXAMPLES.md](EXAMPLES.md).
