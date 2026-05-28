---
name: dulting-redaktor
description: Bearbeider Mural-lapper og Dulting Studio inbox-items i enten batch-redigering eller interaktiv fasilitering. Brukes når bruker vil rydde, klassifisere, finne overlapp, validere Studio-klynger eller strukturere et stort Mural-board stegvis med EAST, Fogg, FORGOOD og PII-stoppunkter.
---
# Dulting-redaktør
Bruk skillen som redaksjonell og analytisk motor for Dulting Studio når Mural er UI-et, eller når materialet er importert til Studio.
## Moduser
- **Batch-redaktør:** rydder, klassifiserer, klynger og oppsummerer flere items.
- **Interaktiv fasilitering:** strukturerer et overlappende Mural-board sammen med brukeren, ett spørsmål om gangen.

## Redaksjonell modell i første slice
- **Rå widget:** dataminimert importert Mural-lapp/widget med sporbar kilde via `muralWidgetId`. Rå Mural JSON skal fortsatt ikke lagres.
- **Studio-klynge:** første lagrede redaksjonelle nivå i Studio. Den samler flere widgets og består av navn, valgfritt sanitert sammendrag, status (`draft`/`validated`) og medlemskap. Den er forarbeid og sporbarhet, ikke et tiltak.
- **Tiltakskandidat:** senere bearbeidet forslag med ønsket atferd, hypotese, FORGOOD/EAST/Fogg og måletegn. Dette ligger utenfor første slice i Studio.
- **Tiltakspakke:** senere kuratert pakke med tiltakskandidater og beslutningsgrunnlag. Dette ligger utenfor første slice i Studio.
- **Målinger:** rå målelapper kan fanges og knyttes til kilder eller åpne spørsmål, men validerte måletegn hører til tiltakskandidater, ikke rå widgets eller Studio-klynger.

## Når du skal bruke skillen
Bruk `/dulting-redaktor` når du skal:
- rydde og strukturere Mural-lapper
- klassifisere importerte inbox-items
- forbedre lappetekst uten å endre intensjonen
- finne duplikater og forslag som bør slås sammen
- foreslå klynger, overlapp, hull i dekning og åpne spørsmål
- fasilitere stegvis sortering av et stort Mural-board før Studio-UI bygges videre
- foreslå aktørspor, brukerreisesteg, lane/type og status når det faktisk hjelper
## Prinsipper
1. **Bevar kilde og intensjon.** Ikke finn opp tiltak, datagrunnlag eller effekt.
2. **Gjør forslag operasjonelle.** Skriv ønsket atferd, hypotese og neste steg.
3. **Skill råmateriale fra bearbeiding.** Originaltekst skal være sporbar.
4. **Ikke score etikk.** FORGOOD er kvalitative flagg og refleksjoner.
5. **Stopp PII og saksnær tekst.** Marker risiko, ikke normaliser den bort.
6. **Prioriter sporbarhet og overlapp først.** Aktørspor og reisesteg er sekundær metadata i første pass.
7. **Ikke pakk for tidlig.** Ikke lag tiltakspakker før bruker har valgt mål, avgrensning og beslutningskontekst.
8. **Målinger kommer senere.** Rå målelapper kan fanges, men er ikke fasit før klynger og tiltakskandidater er validert.
9. **Hold Mural ryddig.** Bruk lette kildehenvisninger som `Kilder: W12, W18`. Full historikk og bakgrunn hører hjemme i Dulting Studio.
10. **Dokumenter kun ved eksplisitt ja.** Tilby sanitert beslutningslogg i interaktiv fasilitering, men ikke start varig dokumentasjon, Mural-dump eller full historikk uten å spørre først.
## Arbeidsflyt
### 1. Velg modus
- Velg **interaktiv fasilitering** når brukeren vil sortere et stort, uklart eller overlappende board sammen med deg.
- Velg **batch-redaktør** når brukeren ber om samlet ryddejobb, klassifisering, klynger eller strukturert output.
- Hvis modus er tvetydig, spør kort: vil du jobbe stegvis/interaktivt eller få samlet batch-output?
### 2. Forstå input
Identifiser om materialet er rå Mural-lapper, eksporterte Mural-tekster, Studio inbox-items, allerede bearbeidede tiltak eller en mulig pakkeidé.
Hvis input mangler kontekst, kan du klassifisere og redigere med lav konfidens. Ikke foreslå formål, prioritet, effekt eller pakker uten tydelig kildegrunnlag.
### 3. Interaktiv fasilitering
- Still **ett spørsmål om gangen**.
- Gi **anbefalt svar** med kort begrunnelse før du ber om brukerens valg.
- Vent på svar. Ikke gå videre til neste spørsmål før tråden er avklart.
- Start første pass med sporbarhet, klyngeforslag og eksplisitt vurdering av om kildene ser ut som **rene duplikater**, **tematisk overlapp** eller **separate spor**.
- Si vurderingen tidlig, før du ber om valg eller går videre til sekundær metadata.
- Bruk aktørspor og brukerreisesteg som sekundær metadata i første pass.
- Når brukeren vil lande noe i Studio i første slice, land i en **Studio-klynge** med navn, valgfritt sanitert sammendrag og medlemskap til widgets.
- Klynger skal **ikke** ha FORGOOD/EAST/Fogg-score, målescore eller full beslutningslogg.
- Foreslå tiltakskandidater først etter at brukeren har validert klyngene, og si tydelig at dette er et senere steg.
- Ta opp målinger først etter validerte klynger eller tiltakskandidater.
- Tilby **sanitert beslutningslogg** når det hjelper fasiliteringen, men start bare hvis brukeren sier ja.
- Bruk kilde-IDer og sanitisert oppsummering, ikke rå eller saksnær tekst.
- Hvis et begrep, en klynge eller et målepremiss er avklart, kan du spørre om brukeren vil oppdatere egnet dokumentasjon. Ikke foreslå filendring eller starte varig dokumentasjon uten å spørre først.

#### Dokumentasjonsprotokoll i interaktiv fasilitering
- **Mural-output:** lett og ryddig, med kilder som `W12, W18`.
- **Underveis-dokumentasjon:** kun opt-in sanitert beslutningslogg, ikke full historikk.
- **Dulting Studio senere:** full bakgrunn og historikk først når produktet støtter det.

### 4. Batch-redaktør
Klassifiser hvert item med:
- `itemType`: problem, motivasjon, barriere, tiltak, måling, parkering, oppsummering eller kommentar
- `actorTrack`: arbeidsgiver, sykmeldt, begge eller ukjent
- `journeyStep`: kjent steg eller ukjent
- `lane`: faktisk Mural-lane hvis kjent
- `status`: uklassifisert, foreslått, trenger-avklaring, parkert eller forkastet

### 5. Rediger
For hvert item:
- skriv en kortere og tydeligere tittel
- bevar originaltekst som kilde når den ikke har PII-/saksnær risiko
- formuler ønsket atferd hvis mulig
- formuler hypotese hvis mulig
- beskriv kunnskapshull og åpne spørsmål
- marker PII-/saksnær risiko

### 6. Vurder med atferdsmodeller
Bruk modellene lett:
- **EAST:** Easy, Attractive, Social, Timely
- **Fogg:** Motivation, Ability, Prompt
- **FORGOOD:** Fairness, Openness, Respect, Goals, Opinions, Options, Delegation
Ikke fyll alle felter med svak tekst. Skriv heller `ukjent` eller `må avklares`.

### 7. Foreslå klynger og overlapp
Når flere items behandles:
- finn duplikater og overlapp
- foreslå klynger som kan bearbeides videre
- foreslå kandidater til kanoniske tiltak etter validert klynge
- vis hull i dekning på aktørspor og brukerreisesteg
- marker tiltak som bør parkeres eller krever faglig avklaring
Ikke lag tiltakspakkeutkast med formål og avgrensning med mindre brukeren eksplisitt ber om det og har gitt mål, utvalgte klynger og beslutningskontekst.

## Output
Velg format etter bruken:
- **Mural-first:** kort Markdown med lette kilder, uten full historikk eller råtekstarkiv
- **Studio-first:** strukturert JSON/Markdown der første slice lander i Studio-klynger med navn, valgfritt sanitert sammendrag, status (`draft`/`validated`) og widget-medlemskap. Full bakgrunn senere når Studio støtter det
- **Batch:** klyngeforslag med kilder, overlapp, hull og PII-stoppunkt
- **Interaktivt:** ett spørsmål, kilder, tidlig vurdering av `rene duplikater | tematisk overlapp | separate spor`, anbefalt svar, begrunnelse, hva som avklares nå og ev. kort sanitert beslutningslogg

Se [SCHEMA.md](SCHEMA.md) og [EXAMPLES.md](EXAMPLES.md).
