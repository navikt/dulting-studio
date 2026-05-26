# ADR-004: Konfigurerbare lane-typer og ikke-skårbasert FORGOOD

**Dato:** 2026-05-25  
**Status:** Foreslått  
**Beslutningstakere:** Team eSyfo, med råd fra produkteiere og fagpersoner som bruker workshopen

## Kontekst

Workshop-strukturen fra Mural følger ikke en ren standardmodell. Materialet er organisert på tvers av workshop-grupper, aktørspor, scenarioer og brukerreisesteg, med lanes som motivasjon, barrierer, tiltak, målinger, parkering og oppsummering.

Hvis vi hardkoder lane-typer eller behandler FORGOOD som totalscore, bygger vi feil domene fra start. Dulting-modellene er refleksjonsrammer, ikke en fast taksonomi for alle lanes og ikke et poengsystem.

## Beslutning

Vi har besluttet at lane- og item-typer i Studio skal være konfigurerbare per prosjekt eller workshop, eller lagres som metadata/fritekst når det er riktig. De skal ikke hardkodes som en liten, fast enum som krever migrering når labels endres.

Vi bruker følgende prinsipper:

- prosjekt eller workshop kan ha egne lane-definisjoner
- lane-definisjoner kan ha stabile tekniske nøkler og redigerbare labels
- Studio kan tilby standardforslag, men labels og rekkefølge skal kunne endres uten migrering
- import skal kunne bevare faktiske lane-navn fra Mural
- EAST, Fogg og FORGOOD lagres som diagnostikk og refleksjon på relevante elementer, ikke som lane-typer
- FORGOOD vurderes per dimensjonene Fairness, Openness, Respect, Goals, Opinions, Options og Delegation
- FORGOOD skal ikke reduseres til totalscore i MVP

Når en workshop ikke har ferdig konfigurasjon, skal Studio heller lagre lane-navn som metadata enn å tvinge dem inn i feil kategori.

Når Studio viser FORGOOD, skal vurderingen derfor vises som separate refleksjoner per dimensjon, ikke som en aggregert etikkscore eller skjult rangeringssignal.

## 3-perspektiv-review

### Arkitektur

Konfigurerbare lane-typer passer bedre med faktisk workshoppraksis og gjør modellen mindre skjør når teamet lærer mer. Det unngår at domenet låses til første workshop eller første visualisering.

### Sikkerhet

Beslutningen handler først og fremst om modellkvalitet, men den reduserer også risikoen for at teamet lager misvisende profiler eller falsk presisjon i et etisk følsomt verktøy. FORGOOD som refleksjon er tryggere enn FORGOOD som score.

### Plattform

Redigerbare labels i data eller prosjektkonfigurasjon er enklere å drifte enn skjema-enumer og gjentatte migrasjoner for navneendringer. Det passer MVP med hyppig læring og liten organisasjon rundt verktøyet.

## Alternativer vurdert

### Alternativ A: Konfigurerbare lane-typer og refleksjonsmodeller (valgt)

**Beskrivelse:** Lane-definisjoner ligger i prosjekt- eller workshopdata, med redigerbare labels og eventuelt stabile tekniske nøkler. Dulting-modellene ligger som egne vurderinger.

**Fordeler:**
- Støtter faktiske lanes fra Mural.
- Endringer i labels krever ikke migrering.
- Holder EAST, Fogg og FORGOOD på riktig nivå som refleksjonsrammer.
- Gir rom for flere case senere uten at første case blir fasit.

**Ulemper:**
- Krever litt mer bevisst modellering av konfigurasjon og metadata.
- Ulike workshops kan få ulike labels som må vises tydelig i UI.

### Alternativ B: Hardkodede lane-enumer i databasen

**Beskrivelse:** Låse lane-typer til et fast sett som appen og databasen kjenner på forhånd.

**Fordeler:**
- Enkelt å validere teknisk.
- Kan gi enklere queries i starten.

**Ulemper:**
- Passer dårlig med faktisk Mural-struktur.
- Label-endringer krever kodeendring og ofte migrering.
- Høy risiko for at teamet modellerer workshopen feil.

### Alternativ C: Bruke FORGOOD som score eller aggregert totalsum

**Beskrivelse:** Oversette FORGOOD til tall eller totalscore som styrer rangering og visualisering.

**Fordeler:**
- Ser enkelt og sammenlignbart ut i UI.
- Kan friste som rask beslutningsstøtte.

**Ulemper:**
- Bryter med formålet med FORGOOD.
- Skaper falsk presisjon og kan skjule reelle etiske avveininger.
- Gir feil signal om at etisk kvalitet kan komprimeres til ett tall.

### Alternativ D: Gjøre ingenting

**Beskrivelse:** Starte uten beslutning og modellere lane-typer ad hoc.

**Fordeler:**
- Ingen beslutningskostnad nå.

**Ulemper:**
- Høy risiko for at lane-typer hardkodes tilfeldig i første implementasjon.
- Vanskeligere å rydde opp senere uten migrering og omskriving.

## Nav-spesifikke vurderinger

### Sikkerhet og personvern

- **Dataklassifisering:** Intern arbeidsflate. Beslutningen endrer ikke dataklassifisering.
- **Auth-mekanisme:** Ingen endring.
- **PII-håndtering:** Konfigurerbare lane-labels skal fortsatt følge datagrensene og ikke brukes til å beskrive personer, diagnoser eller saksnære forhold.
- **Tilgangsstyring:** Ingen nye avhengigheter eller `accessPolicy`-behov.
- **Personvern:** FORGOOD som kvalitativ refleksjon reduserer risikoen for misvisende automatiserte vurderinger av sårbare grupper.

### Plattform (Nais/GCP)

- **Infrastrukturkrav:** Ingen nye plattformkomponenter.
- **Ressursbehov:** Lavt. Mer fleksibilitet i data gir mindre behov for skjemaendringer.
- **Observerbarhet:** Ingen særskilte nye krav utover vanlig teknisk logging uten innhold.
- **CI/CD-endringer:** Standardlabels kan ligge i kode eller seed-data, men prosjektspesifikke labels skal kunne endres uten databasemigrering.

### Team og organisasjon

- **Berørte team:** Team eSyfo og fagpersoner som bruker workshopmaterialet.
- **Architecture Advice:** Bør avklares før første datamodell og UI bygges.
- **Migrasjonsstrategi:** Start fleksibelt. Ikke innfør enum-basert låsing som må brytes opp senere.
- **Tilbakerulling:** Enkel. Standardforslag kan justeres uten store tekniske inngrep.
- **Tidsramme:** Før modellering av prosjekt, import og visning.

## Konsekvenser

### Positive

- Modellen følger faktisk arbeidsmåte bedre.
- Label-endringer og nye lanes kan tas inn uten migrering.
- FORGOOD beholdes som etisk refleksjon, ikke tallspill.

### Negative

- Litt mer fleksibilitet gir litt mer ansvar i UI og validering.
- Sammenligning på tvers av prosjekter må bygge på tydelige visninger, ikke like enum-verdier.

### Risiko

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|--------|--------------|------------|-----------|
| Første implementasjon hardkoder likevel lane-typer | Middels | Høy | Lås beslutningen i ADR og bruk prosjektkonfigurasjon fra start |
| Teamet bruker FORGOOD som skjult score i UI | Middels | Høy | Dokumenter eksplisitt at FORGOOD er kvalitativ refleksjon uten totalscore |
| Utydelige labels gjør data vanskelig å lese | Middels | Middels | Ha standardforslag og vis både teknisk nøkkel og label der det trengs |

## Aksjonspunkter

- [ ] Definer forslag til standardlaner for første workshop uten å låse modellen — teamet — før Fase 1
- [ ] Beskriv hvordan prosjekt/workshop lagrer egne lane-labels — teamet — før datamodellering
- [ ] Dokumenter at EAST, Fogg og FORGOOD er egne vurderingsspor, ikke lane-typer, og vis FORGOOD per dimensjon — teamet — før UI-skisser
- [ ] Legg inn validering som stopper totalscore for FORGOOD i MVP — teamet — før implementasjon
