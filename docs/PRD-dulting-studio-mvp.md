# PRD for dulting-studio MVP

## Kort beskrivelse

`dulting-studio` er en intern beslutningsapp for Team eSyfo. Appen skal hjelpe teamet og berørte produkteiere med å utvikle, vurdere og prioritere dultingtiltak med tydelig datagrunnlag, klare datagrenser og synlig etisk risiko.

Første case er oppfølgingsplanen. På sikt skal appen også kunne brukes for dialogmøte 1, aktivitetskrav og andre kontaktflater i sykefraværsoppfølgingen.

## Problemet vi skal løse

Arbeidet med dultingtiltak skjer lett i mange dokumenter, presentasjoner og møter. Da blir det vanskelig å se:

- hva problemet faktisk er
- hvilke tiltak som bygger på data og hvilke som bygger på antakelser
- hvilke personvern- og etikkgrenser som gjelder
- hvilke tiltak som er vurdert, forkastet eller klare for eksperiment
- hvordan en tiltakspakke samlet ser ut når vi vurderer trygghet og risiko

Vi trenger derfor ett sted der forslag kan beskrives likt, vurderes likt og sammenlignes uten å hente inn personopplysninger eller bygge en tung admin-løsning.

## Målgruppe

### Primærmålgruppe

- Team eSyfo
- Produkteier for oppfølgingsplanen
- Andre berørte produkteiere i sykefraværsoppfølgingen
- Fagpersoner som bidrar med innsikt, analyse, innhold eller vurdering av tiltak

### Sekundærmålgruppe

- Sikkerhet, personvern og juridiske roller som skal kunne gi råd eller stoppe tiltak
- Ledere som trenger et beslutningsgrunnlag før eksperiment eller tiltakspakke godkjennes

## Mål

MVP-en skal gjøre det mulig å:

1. registrere forslag til dultingtiltak i en fast struktur
2. vise hva som er hypotese, hva som er dokumentert og hva som mangler
3. synliggjøre personvern-, etikk- og trygghetsrisiko per tiltak og samlet per tiltakspakke
4. styre forslag gjennom en enkel statusflyt fram til klar for eksperiment
5. gjøre dette uten personopplysninger, produksjonsdata eller database

## Ikke-mål

MVP-en skal ikke:

- være en admin-app for drift av produksjonsflater
- koble seg til produksjonssystemer eller produksjonsdata
- bygge database eller eget analysegrunnlag
- ha dashboards for brukstall eller effektmåling
- ha GitHub API-integrasjon
- automatisk publisere endringer til andre systemer
- brukes til vurdering av enkeltsaker

## Første case: oppfølgingsplan

Oppfølgingsplanen er første case fordi:

- den er et tydelig prioriteringsområde i oppdraget
- Team eSyfo kjenner domenet godt
- kontaktflaten egner seg for å formulere konkrete tiltakshypoteser
- vi kan lage et første rammeverk uten å hente inn produksjonsdata

MVP-en skal derfor inneholde:

- en case-side for oppfølgingsplan
- en fast mal for problem, målgruppe, hypotese, forventet effekt og datagrunnlag
- forslag til tiltakspakker som består av flere enkelttiltak
- FORGOOD-visualisering for enkelttiltak og tiltakspakke

## AI-assistert og filbasert arbeidsflyt

MVP-en skal bruke et strukturert filbasert datalag i repoet. Det betyr at innhold ligger i versjonerte filer, ikke i database.

### Arbeidsflyt i MVP

1. Teamet beskriver et forslag i en fast mal.
2. Copilot/Hovmester kan hjelpe med å strukturere teksten og foreslå manglende felter.
3. Forslaget lagres som fil i repoet, for eksempel YAML eller JSON for struktur og Markdown for begrunnelser.
4. Appen leser filene og viser dem som case, tiltak og tiltakspakker.
5. Endringer kvalitetssikres i pull request med CODEOWNERS.

### AI-guardrails i MVP

- AI-generert innhold er underlagt de samme datagrensene som manuelt skrevet innhold.
- AI-assistanse skal ikke lage syntetiske enkeltsaker eller helse-/diagnoseeksempler.
- AI-assistanse skal ikke brukes til å generere innhold som ligner virkelige saker, personer, arbeidsgivere eller små sårbare grupper.
- AI-generert innhold må gjennom vanlig PR-review og faglig review før det kan bli del av datagrunnlaget i repoet.
- AI brukes som skrive- og strukturstøtte, ikke som autoritativ kilde eller automatisk beslutningstaker.

### Hva dette gir

- sporbar historikk
- enkel review
- lav teknisk kompleksitet i MVP
- tydelig skille mellom innholdsarbeid og eventuell senere systemintegrasjon

### Hva dette ikke gir

- direkte redigering i GitHub fra appen
- sanntids-samarbeid
- automatisk kobling til effektdata eller produksjonssystemer

## Dultingrammeverk i MVP

MVP-en skal støtte tre faste vurderingsspor:

### EAST

- Easy
- Attractive
- Social
- Timely

Tiltak skal kunne beskrives mot disse fire dimensjonene med korte, konkrete begrunnelser.

### Fogg B=MAP

- Motivation
- Ability
- Prompt

Tiltak skal beskrive hva som antas å være flaskehalsen, og hvorfor tiltaket passer.

### FORGOOD

FORGOOD skal brukes som trygghets- og etikkramme. Målet er ikke å produsere en pen totalscore. Målet er å vise hvor tiltaket kan være risikabelt, uavklart eller uønsket.

FORGOOD-dimensjonene skal vises eksplisitt i MVP-en:

- **Fairness** — rettferdighet: rammer tiltaket noen grupper skjevt eller uforholdsmessig?
- **Openness** — åpenhet: er det synlig at og hvorfor brukeren blir dultet?
- **Respect** — respekt: bevares autonomi, verdighet og en reell mulighet til å velge annerledes?
- **Goals** — mål: er målet legitimt og i brukerens interesse, ikke bare i systemets interesse?
- **Opinions** — meninger/aksept: ville brukerne akseptere tiltaket hvis de visste hvordan det virker?
- **Options** — valgmuligheter: finnes det reelle alternativer uten ekstra friksjon?
- **Delegation** — legitimitet for avsender: er det riktig instans som dulter i denne konteksten?

Normative utsagn må ha datagrunnlag. Hvis datagrunnlaget mangler, skal det vises tydelig som en mangel, ikke skjules bak språk eller score.

Tiltak som bygger på helseopplysninger, diagnosegrupper, små segmenter eller sårbare grupper skal stoppes i MVP.

## FORGOOD-visualisering

FORGOOD-visualiseringen er sentral i MVP.

### Krav til visualiseringen

- vise profil per tiltak
- vise samlet profil for tiltakspakke
- vise begrunnelser, røde flagg og åpne spørsmål
- synliggjøre usikkerhet
- unngå falsk presisjon
- ikke kollapse alt til én totalscore

### Anbefalt form i MVP

- enkel profilvisning per dimensjon med farge og kort begrunnelse
- egen markering for manglende grunnlag
- samlet tiltakspakke vist som en profil med spredning og svakeste punkt
- tydelig liste over hva som må avklares før eksperiment

## Datagrenser og personvernramme

Disse grensene gjelder for hele MVP-en:

- Ingen PII
- Ingen diagnosegrupper
- Ingen konkrete saker
- Ingen små eller sårbare segmenter
- Ingen produksjonsdata
- Ingen fritekst som kan beskrive enkeltsaker

Tillatt datagrunnlag i MVP:

- aggregert innsikt på høyt nivå
- offentlig regelverk og offentlige kilder
- generelle funn fra forskning eller tidligere evalueringer
- redaksjonelt bearbeidede problemformuleringer uten kobling til person eller sak
- eventuelle illustrerende eksempler kun når de er generiske, ikke saksnære og ikke beskriver helse, diagnose eller enkeltpersoner

Ikke tillatt i MVP:

- tekstutdrag fra virkelige saker
- beskrivelser som kan identifisere en person, arbeidsgiver eller virksomhet
- segmentering som gjør små grupper eller sårbare grupper gjenkjennelige
- fritekstfelt uten tydelig avgrensning og review
- syntetiske enkeltsaker eller syntetiske helse-/diagnoseeksempler

Hvis teamet senere vil utvide grensene, må det tas ny beslutning med ny sikkerhets- og personvernvurdering.

## Governance og statusflyt

MVP-en skal ha en enkel og tydelig statusflyt:

1. **Forslag**
2. **Vurderes**
3. **Forkastet**
4. **Klar for eksperiment**

### Hva statusene betyr

#### Forslag

Et tiltak eller en tiltakspakke er registrert, men ikke kvalitetssikret. Minstekrav:

- problem er beskrevet
- hypotese er formulert
- case er valgt
- datagrenser er bekreftet

#### Vurderes

Forslaget er tatt inn til aktiv vurdering. Minstekrav:

- datagrunnlag eller tydelige kunnskapshull er dokumentert
- EAST, Fogg og FORGOOD er fylt ut
- risiko og åpne spørsmål er synlige
- relevante roller er knyttet til forslaget

#### Forkastet

Forslaget brukes ikke videre. Det skal ha en kort og konkret begrunnelse, for eksempel:

- mangler datagrunnlag
- bryter datagrenser
- vurderes som for risikabelt
- løser ikke riktig problem

#### Klar for eksperiment

Forslaget kan tas videre til produktteamets eksperiment- eller implementasjonsløp. Minstekrav:

- beslutningseier har godkjent
- etikk/personvern-veto er avklart
- berørte produkteiere er hørt
- måling og stoppkriterier er beskrevet
- ingen røde funn står åpne uten plan

### Roller i governance

- **Beslutningseier:** produkteier eller annen rolle med ansvar for berørt kontaktflate. Konkrete personer: TBD.
- **Etikk/personvern-veto:** relevant personvern-, sikkerhets- eller juridisk rolle. Konkrete personer: TBD.
- **Berørte produkteiere:** roller for oppfølgingsplan og senere andre kontaktflater. Konkrete personer: TBD.
- **Fasilitator/redaktør:** Team eSyfo holder struktur, kvalitet og framdrift.

### Prinsipper for statusendring

- Bare vurderte forslag kan bli klare for eksperiment.
- Forkastede forslag kan ikke åpnes igjen uten ny begrunnelse.
- Uenighet om personvern eller etikk stopper overgang til klar for eksperiment.
- Manglende datagrunnlag skal være synlig og telle mot beslutning, ikke skjules i tekst.

## Suksesskriterier for MVP

MVP-en er vellykket når teamet kan:

- beskrive minst ett oppfølgingsplan-case med full struktur
- registrere og sammenligne flere tiltak uten å bruke persondata
- vise en tiltakspakke med FORGOOD-profil uten totalscore
- dokumentere hvorfor tiltak er vurdert, forkastet eller klare for eksperiment
- gjennomføre review i pull request uten behov for database eller GitHub API

## Hva som må være på plass før Tiltakspakke 1 kan besluttes

Før Tiltakspakke 1 kan besluttes, må følgende være på plass:

1. Oppfølgingsplan som første case er dokumentert i appen.
2. Minst én tiltakspakke er beskrevet med enkelttiltak, hypotese og forventet effekt.
3. Hvert tiltak har dokumentert datagrunnlag eller tydelig markert kunnskapshull.
4. FORGOOD-profil er fylt ut for hvert tiltak og for tiltakspakken samlet.
5. Datagrenser er kontrollert og ingen røde personvernfunn står åpne.
6. Beslutningseier har sett saken.
7. Etikk/personvern-veto er avklart.
8. Berørte produkteiere har gitt innspill.
9. Måleplan og stoppkriterier for eksperiment er skrevet.
10. Tiltaket er fortsatt innenfor ikke-målene for MVP.

## Åpne spørsmål etter Fase 0

- Hvilken filstruktur er best for tiltak, pakker og beslutningslogger?
- Skal appen kun lese repo-filer i første versjon, eller også støtte lokal import av filer?
- Hvilke interne roller skal ha tilgang i første prod-versjon?
- Hvilken visualisering er lettest å forstå uten å gi falsk trygghet?
- Hvordan dokumenterer vi datagrunnlag på en enkel og lik måte på tvers av case?
