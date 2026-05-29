# Sykmeldt-brukerreise — bearbeidet utkast (sparringsgrunnlag)

> **Status:** Utkast / materiale, **ikke bygget**. Dette er forarbeidet jeg har
> gjort på egen hånd så vi har noe konkret å sparre på før vi bygger
> sykmeldt-komponenten. Det speiler arbeidsgiver-brukerreisen
> (`src/components/brukerreise/journey-data.ts`) i struktur, men sett fra den
> **sykmeldte** sin side.
>
> Forankret i:
> - råkort: `docs/dulting-tiltaksregister-sykmeldt.md` (SYK-01..19 + SYK-R1..R4)
> - «hvorfor»-laget: `docs/dulting-atferdskartlegging.md` (motivasjon/barriere + KPI)
> - AG-mønsteret: `src/components/brukerreise/journey-data.ts`
>
> Illustrativt, syntetisk — ingen reelle personer, saker eller helseopplysninger.

---

## 0. Hovedgrepet: sykmeldt-sporet som motstykke til AG

Arbeidsgiver-reisen handler om å få **nærmeste leder tidligere i gang**.
Sykmeldt-reisen er komplementet: gjøre den **sykmeldte til en informert,
medvirkende part — ikke en passiv mottaker — uten å presse fram feil handling.**

Tre ting skiller sykmeldt-sporet fra AG-sporet, og bør styre hele reisen:

1. **Medvirkningsplikt som speil av oppfølgingsplikt.** Der AG har
   tilretteleggings-/oppfølgingsplikt, har den sykmeldte medvirknings- og
   aktivitetsplikt. Begge må behandles med samme varsomhet: *informere uten å
   presse fram feil handling*. (Workshop: «kun 30 % gjør det Nav ber om» — målet
   er å flytte folk fra ingenting til et minimum, ikke å true.)
2. **«Sykmeldt fra oppgavene, ikke fra arbeidsplassen.»** (SYK-12/13) Dette er
   det sterkeste framing-grepet i hele materialet og bør gå igjen som en rød tråd
   — det åpner mulighetsrommet for medvirkning og tilrettelegging.
3. **Unngå «passiv part».** (Atferdskartlegging: «Hvordan kan vi unngå at den
   sykmeldte blir en passiv part? Det er viktig at de selv tar eierskap.») I
   dagens nye plan er det bare AG som skriver — sykmeldt er strukturelt passiv.

### To-sidige touchpoints (delt med AG)

Flere sykmeldt-steg er motstykket til et AG-steg på samme touchpoint. SYK-R3 sier
eksplisitt at noe «bør arbeidsgiver informeres om». Disse må designes som **ett
delt touchpoint sett fra to sider**, ikke to uavhengige løp:

| Touchpoint | AG-side (eksisterende reise) | Sykmeldt-side (denne) |
|---|---|---|
| Behovsvurdering uke 4 | Steg 03 «Trenger vi en plan?» | Egen vurdering, kan dele med Nav; ja → varsel til AG (SYK-07/08/09) |
| Samtale + planarbeid | Steg 04 «Samtale og planarbeid» | Forbered samtalen + medvirke i planen (SYK-11..14) |
| Deling med lege/Nav | Steg 05 «Deling» | Sykmeldt kan også dele (atferdskort, SYK-R3) |
| Evaluering | Steg 06 «Evaluering» | Egen påminnelse + evalueringsside (SYK-15..18) |

### Sykmeldt-spesifikke flater (ingen AG-parallell)

- **Sykmeldingen / «Ditt sykefravær».** NB (SYK-R2): sykmeldingsflaten eies av et
  annet team (Symfoni eier sykmelding, Flex eier «Ditt sykefravær») — å få info
  *inn i sykmeldingen* er organisatorisk vanskeligere enn på AG-flatene.
- **Kartleggingsspørsmål** (pilot Troms og Finnmark, mulig nasjonalt). Egen,
  eksisterende flate som **ikke** finnes i AG-registeret. SYK-19: vi må forklare
  bedre at kartleggingsspørsmål ≠ oppfølgingsplan.
- **SMS / «bjella» / microfrontend på nav.no** — påminnelses- og informasjonskanaler.

---

## 1. Persona, kanaler og mission (forslag — parallelt til AG)

- **Persona:** den sykmeldte **Jonas** (samme syntetiske person som AG-reisen
  følger via leder «Maria»). Ingen diagnose vises.
- **Mission (forslag):**
  - track: «Sykmeldt-sporet · medvirkning i egen oppfølging»
  - tittel: «Brukerreise for den sykmeldte»
  - lead: «Hvordan dulting kan gjøre den sykmeldte til en informert, medvirkende
    part i egen oppfølging — fra dagens passive flyt, mot en der man forstår
    pliktene sine, vurderer behov tidlig og medvirker i planen.»
- **Kanaler (forslag — `ChannelKey` for et fremtidig sykmeldt-datagrunnlag):**

  | key | label | merknad |
  |---|---|---|
  | `sykmelding` | Sykmeldingen | eies av annet team (SYK-R2) |
  | `dsf` | Ditt sykefravær | sykmeldtes hovedflate (Flex) |
  | `sms` | SMS | påminnelser (uke 4) |
  | `kartlegging` | Kartleggingsspørsmål | pilot T&F, mulig nasjonalt |
  | `plan` | Oppfølgingsplan | **delt** flate med AG |
  | `nav` | Nav | varsel / bjella |

---

## 2. Bearbeidede tiltakskandidater (SYK-* → struktur)

Samme felt som AG-bearbeidingen: **ønsket atferd · barriere (4 kat.) · motivasjon
(5 drivere) · dult · EAST/Fogg-flagg (kvalitative, ikke skår) · måletegn ·
guardrail · delt med AG?**. Gruppert etter de fire temaene fra råkortregisteret.

> Barriere-kat.: Tidspress · Manglende rutiner · Relasjon og tillit ·
> Kunnskapsmangel og uklarhet. Motivasjons-drivere: Autonomi · Identitet ·
> Tilhørighet · Plikt/ytre · Ytre insentiver.

### A. Tidlig info, plikt og forståelse (SYK-01..06, R1, R2)

| Råkort | Ønsket atferd | Barriere | Motivasjon | Dult (kort) | EAST/Fogg | Delt? |
|---|---|---|---|---|---|---|
| SYK-01 | Sykmeldt kjenner medvirknings-/aktivitetsplikt ved evaluering | Kunnskapsmangel | Plikt/ytre | Plikt-info i kontekst, lett språk | Easy, Timely / Prompt | – |
| SYK-02 | Sykmeldt kontakter nærmeste leder | Manglende rutiner | Identitet | Dult i sykmeldingen + hva gevinsten er | Attractive, Timely | (AG: leder venter på kontakt) |
| SYK-03 | Forstår dialogmøte 1 / plan uten tunge ord | Kunnskapsmangel | Plikt/ytre | Forklar prosessen, unngå sjargong | Easy | – |
| SYK-04 + R1 | Forstår hva **leder** skal gjøre (symmetri) | Kunnskapsmangel | Tilhørighet | Vis leders ansvar → trygghet på prosessen | Social, Easy | ✔ symmetri m/ AG |
| SYK-05 | Kjenner plikter fra dag 1 | Kunnskapsmangel | Plikt/ytre | Microfrontend på nav.no, dag 1 | Timely / Prompt | – |
| SYK-06 | Ser verdien av god dialog m/ AG | — | Identitet | «God dialog → raskere tilbake i jobb» | Attractive (motivasjon) | – |

### B. Tidsriktig signal og egen behovsvurdering (SYK-07..09, R3, R4)

| Råkort | Ønsket atferd | Barriere | Motivasjon | Dult (kort) | EAST/Fogg | Delt? |
|---|---|---|---|---|---|---|
| SYK-07 | Vurderer behov for plan før uke 4 (egen vurdering) | Tidspress | Autonomi | Ekstra info ~4 uker + pop-up i kvittering; fyll ut egen vurdering | Timely, Easy | ✔ (AG steg 03) |
| SYK-08 | Svarer på SMS-påminnelse om plan/behov | Manglende rutiner | Plikt/ytre | SMS uke 4 ved manglende plan; vurdering kan deles m/ Nav (lege?) | Prompt, Timely | ✔ |
| SYK-09 + R4 | Vurdering via bjella; ja → varsel til AG | Manglende rutiner | Autonomi + Plikt | Oppgave i bjella; del m/ Nav; trigg AG-varsel | Social, Prompt | ✔ (mulig vurderingsskjema) |

### C. Forstå og forberede planen (SYK-11..14)

| Råkort | Ønsket atferd | Barriere | Motivasjon | Dult (kort) | EAST/Fogg | Delt? |
|---|---|---|---|---|---|---|
| SYK-11 | Forstår hva en plan er + gevinsten | Kunnskapsmangel | Autonomi | Enklere verktøy/guide enn i dag | Easy, Attractive | – |
| SYK-12 | Forbereder seg til samtalen m/ leder | Relasjon og tillit | Autonomi | Forberedelsesskjema: «hva bør du tenke på» | Easy, Timely | ✔ (AG steg 04) |
| SYK-13 | Ser muligheten for andre oppgaver (medvirkning) | Kunnskapsmangel | Identitet | «Sykmeldt fra oppgavene, ikke arbeidsplassen» + konkrete eksempler | Attractive | – |
| SYK-14 | Tør gå inn i dialogen m/ AG | Relasjon og tillit | Tilhørighet | Samtaleguide (idébanken) for å trygge | Easy, Social | ✔ |

### D. Medvirke, evaluere, kontinuitet (SYK-15..19, R3 + atferdskort)

| Råkort | Ønsket atferd | Barriere | Motivasjon | Dult (kort) | EAST/Fogg | Delt? |
|---|---|---|---|---|---|---|
| (atferdskort) | Medvirker i planen (skriver inn asynkront / kommenterer / ber om plan) | Manglende rutiner | Autonomi | La sykmeldt skrive i/ kommentere planen; «be AG lage plan» → AG-oppgave | Easy, Social | ✔ |
| SYK-15 | Setter realistisk evalueringsdato | Manglende rutiner | Autonomi | Default-dato (4 uker / siste sykmeldingsdag) | Easy (default) | ✔ |
| SYK-16 | Forbereder seg til evalueringen | Kunnskapsmangel | Plikt/ytre | Påminnelse + mal på hva man bør ta stilling til | Timely, Easy | ✔ |
| SYK-17 | Sier hva som virker / er utfordrende | — | Autonomi | Evalueringsside: marker tiltak (unngå ordet «funket») | Easy | ✔ |
| SYK-18 | Lager/justerer ny plan ved lengre fravær | Manglende rutiner | Autonomi | Oppfordre til flere planer; «ingenting er hugget i stein» | Attractive | ✔ |
| SYK-19 | Skiller kartleggingsspørsmål fra oppfølgingsplan | Kunnskapsmangel | — | Forklar forskjellen tydelig (særlig når kartlegging går nasjonalt) | Easy | – |

**SYK-R2** (sykmeldingsflaten eies av annet team) er ikke et tiltak, men en
**gjennomgående guardrail**: alt som krever endring *i selve sykmeldingen* har
høyere gjennomføringskostnad — fall heller tilbake på «Ditt sykefravær» / SMS /
bjella der mulig.

---

## 3. Utkast til sykmeldt-brukerreisen (6 steg)

Samme tre-lags-modell som AG: **faktisk i dag → lov-idealet → endret flyt med
dulting**, med why-laget (barriere + motivasjon) per steg. Steg 1, 2, 4, 5, 6 er
**to-sidige** (delt touchpoint med AG-reisen); steg 3 er sykmeldt-spesifikt.

### Steg 01 — Sykmelding sendt: hva skjer nå? · *Dag 0–3* · `både`
- **Faktisk i dag:** Etter innsendt sykmelding møter Jonas en stort sett passiv
  kvitterings-/informasjonsside (gradering, varighet). Ingenting om plikter, om
  hva som skjer videre, eller om å ta kontakt med leder.
- **Lov-idealet:** Den ansatte kontakter leder og medvirker i egen oppfølging.
- **Barriere — Kunnskapsmangel og uklarhet:** Jonas vet ikke hva som forventes,
  hva en oppfølgingsplan er, eller hva leder skal gjøre.
- **Motivasjon — Plikt og ytre forventninger / Identitet:** De fleste vil «gjøre
  det rette» hvis det er tydelig og lavterskel — men plikt-språk må være lett, ikke
  truende.
- **Dult:** Lett, motiverende info fra dag 1 (microfrontend / «Ditt sykefravær»):
  hva skjer nå, dine plikter (uten tunge ord), og en oppfordring om å ta kontakt
  med leder — med *hvorfor det lønner seg*. Framing: «du er sykmeldt fra
  oppgavene, ikke fra arbeidsplassen».
- **Nudge-copy (utkast):** «Du er sykmeldt — her er hva som skjer videre. En kort
  prat med lederen din tidlig gjør resten enklere. Se hva du kan forvente.»
- **Ønsket atferd:** Jonas forstår prosessen og tar (eller er åpen for) tidlig kontakt.
- **Avveining (SYK-R2):** Å legge dette *i sykmeldingen* eies av et annet team —
  start på «Ditt sykefravær»/microfrontend.
- **Måletegn:** % sykmeldte som forstår egne plikter (Lumi på min side) · besøk på
  info-/sykefraværsside etter sykmelding.
- **Refs:** SYK-02, SYK-03, SYK-05, SYK-06; framing SYK-13.

### Steg 02 — Tidsriktig signal + egen behovsvurdering · *Uke 3–4* · `to-sidig`
- **Faktisk i dag:** Ingen tidsriktig påminnelse til den sykmeldte om at en plan
  snart bør vurderes; ingen måte å gjøre en egen behovsvurdering.
- **Lov-idealet:** Behov for plan vurderes rundt uke 4.
- **Barriere — Tidspress / Manglende rutiner:** Uten en konkret utløser sklir det.
- **Motivasjon — Autonomi og eierskap:** Å få gjøre en *egen* vurdering (ikke bare
  vente på leder) gir eierskap.
- **Dult:** SMS/varsel ~uke 4 ved manglende plan: «vurder behovet for en
  oppfølgingsplan». Egen vurdering kan deles med Nav; svarer Jonas «ja», trigges et
  varsel til arbeidsgiver (den to-sidige koblingen). Evt. pop-up i
  sykmeldings-kvitteringen.
- **Nudge-copy (utkast):** «Det er snart fire uker. Mange lager en oppfølgingsplan
  med lederen sin nå. Vil du vurdere behovet? Det tar et par minutter.»
- **Ønsket atferd:** Jonas tar stilling tidlig, og signalet når leder.
- **Måletegn:** Antall egne behovsvurderinger innen uke 4 · andel «ja» som utløser
  AG-varsel · besøk på sykmelding/flate etter SMS.
- **Refs:** SYK-07, SYK-08, SYK-09, SYK-R3, SYK-R4. **Delt** med AG steg 03.

### Steg 03 — Kartleggingsspørsmål: og hva det *ikke* er · *Uke 7* · `sykmeldt-spesifikt`
- **Faktisk i dag:** Kartleggingsspørsmålene (pilot Troms og Finnmark) oppleves
  lett som «det samme som oppfølgingsplanen» — det skaper forvirring, særlig hvis
  flaten går nasjonalt.
- **Barriere — Kunnskapsmangel og uklarhet:** To liknende flater uten tydelig skille.
- **Motivasjon — Autonomi:** En ny anledning til å vurdere behov selv.
- **Dult:** Bruk kartleggingsspørsmålene som en *ny påminnelse* om å vurdere behov
  (SYK-10), men med en tydelig forklaring av forskjellen kartlegging vs.
  oppfølgingsplan (SYK-19).
- **Ønsket atferd:** Jonas vet hva de to flatene er, og vurderer behov på nytt.
- **Avveining:** Sterkt geografi-avhengig (pilot) — må ikke forutsette at alle ser
  denne flaten.
- **Måletegn:** Andel som vurderer behov via kartlegging · selvrapportert forståelse
  av forskjellen (Lumi).
- **Refs:** SYK-10, SYK-19.

### Steg 04 — Forbered samtalen med leder · *Etter vurdering, uke 4–5* · `to-sidig`
- **Faktisk i dag:** Jonas går ofte uforberedt inn i samtalen; usikker på hva en
  plan er og hva man kan/bør si.
- **Lov-idealet:** Samtale om tilrettelegging som munner ut i en plan.
- **Barriere — Relasjon og tillit:** Samtalen er personlig; ung ansatt vil ikke
  alltid snakke med leder; leder kan være tidligere «kompis».
- **Motivasjon — Autonomi + Tilhørighet:** Forberedelse gir trygghet og en bedre
  relasjon.
- **Dult:** Forberedelsesskjema («hva bør du tenke på når du skal lage en plan med
  lederen din») + samtaleguide (idébanken) + framingen «sykmeldt fra oppgavene»
  med konkrete eksempler på hva man *kan* gjøre.
- **Nudge-copy (utkast):** «Snart skal du og lederen din lage en plan. Her er noen
  ting det kan være lurt å tenke gjennom først — du er sykmeldt fra oppgavene
  dine, ikke fra arbeidsplassen.»
- **Ønsket atferd:** Jonas møter forberedt og bidrar reelt.
- **Måletegn:** Visninger av forberedelsesskjema før plan · % sykmeldte som føler
  seg ivaretatt ved første samtale (Lumi).
- **Refs:** SYK-11, SYK-12, SYK-13, SYK-14. **Delt** med AG steg 04.

### Steg 05 — Medvirke i planen (og deling) · *Når plan finnes, uke 5–6* · `to-sidig`
- **Faktisk i dag:** I den nye planen er det bare arbeidsgiver som skriver —
  Jonas er strukturelt en passiv part. Deling med lege/Nav initieres av AG.
- **Lov-idealet:** Planen lages *sammen*; deles med fastlege (uke 4–6) og Nav ved behov.
- **Barriere — Manglende rutiner (teknisk):** Ingen funksjon for at sykmeldt skriver
  inn / kommenterer / ber om plan.
- **Motivasjon — Autonomi og eierskap:** Reell medvirkning er selve poenget — og
  motgiften mot «passiv part».
- **Dult:** La Jonas skrive inn/kommentere i planen (asynkront), be AG lage en plan
  (→ AG-oppgave), og kunne dele planen med lege/Nav selv.
- **Nudge-copy (utkast):** «Planen er deres — ikke bare lederens. Du kan legge til
  det du mener er viktig, og dele den med fastlegen din.»
- **Ønsket atferd:** Jonas medvirker konkret; planen blir delt tidligere.
- **Avveining:** Må ikke føre til dobbel-varsling når plan allerede er delt (jf.
  atferdskort), eller at sensitive opplysninger deles ukritisk.
- **Måletegn:** Andel planer med sykmeldt-medvirkning · deling med lege/Nav opp ·
  tidlig deling (aggregert).
- **Refs:** SYK-R3 + atferdskort (medvirkning/deling). **Delt** med AG steg 04–05.

### Steg 06 — Evaluering og kontinuitet · *Videre oppfølging, ~uke 12* · `to-sidig`
- **Faktisk i dag:** Planen har en evalueringsdato, men ingenting minner Jonas om
  den, og evalueringen gir lite støtte.
- **Lov-idealet:** Planen evalueres og justeres med den ansatte.
- **Barriere — Manglende rutiner:** Ingen påminnelse, ingen recap.
- **Motivasjon — Autonomi og eierskap:** En levende, endrbar plan inviterer til å
  komme tilbake.
- **Dult:** Egen påminnelse til den sykmeldte med en mal for hva man bør ta stilling
  til; evalueringsside der Jonas markerer hvilke tiltak som virker / er utfordrende;
  oppfordring til flere planer ved lengre fravær.
- **Nudge-copy (utkast):** «Det er en stund siden planen ble laget. Hva virker for
  deg nå, og hva er fortsatt vanskelig? Ta det med inn i en ny prat med lederen din.»
- **Ønsket atferd:** Jonas forbereder og deltar i evalueringen; planen justeres.
- **Måletegn:** Flere som evaluerer planen · plan åpnet/justert senere · rating av tiltak.
- **Refs:** SYK-15, SYK-16, SYK-17, SYK-18. **Delt** med AG steg 06.

---

## 4. Måletegn → KR (sykmeldt-vinklet)

Reisen ladrer opp til de samme AID/IA-KR-ene som AG-reisen, men via sykmeldtes
medvirkning:

| KR (AID / IA 2025–2028) | Sykmeldtes bidrag |
|---|---|
| Flere oppfølgingsplaner — og tidligere | Egen behovsvurdering uke 4 + «be om plan» |
| Flere tar stilling til behov innen uke 10 | Steg 02 + 03 (signal + kartlegging) |
| Plan sendt uten å vente på veileder | Sykmeldt kan dele selv (steg 05) |
| Flere gjennomførte dialogmøte 1 | Forberedt, medvirkende sykmeldt (steg 04) |
| Økt gradert sykmelding · kortere fravær | Tidlig deling m/ lege gir grunnlag for gradering |

Lumi-baserte måletegn (fra KPI-kortene) som er sykmeldt-spesifikke: forståelse av
egne plikter; følelse av å være ivaretatt ved første samtale; om man ble kontaktet
før/tidlig i sykmeldingen.

---

## 5. Åpne spørsmål til sparring (her trenger jeg deg)

1. **Steg-antall og parring.** Funker 6 steg, eller bør steg 02 (signal +
   behovsvurdering) splittes slik AG har det (eget tidlig-signal + egen
   behovsvurdering)? Jeg slo dem sammen fordi sykmeldt ikke har AGs «frist»-press
   på samme måte.
2. **Kartleggingsspørsmål (steg 03).** Skal denne være et eget steg, eller en
   «avveining/kontekst-boks» (siden den er geografisk pilot)? Den finnes ikke for AG.
3. **To-sidig visning.** Skal sykmeldt- og AG-reisen kunne vises **side om side**
   på de delte touchpointene (split-view), eller som to separate reiser man kan
   bytte mellom? Det første er mer ambisiøst, men viser «ett touchpoint, to sider».
4. **«Sak»-begrepet.** Din domenekunnskap (ikke i noen lapp): hører «sak»/
   arbeidsflate hjemme i sykmeldt-reisen («oppfølging» som egen underside på Ditt
   sykefravær, jf. atferdskort), eller holder vi det til AG?
5. **Tone i plikt-språket.** Hvor hardt kan vi snakke om medvirknings-/
   aktivitetsplikt før det tipper fra «informere» til «presse»? (Workshop-rammen:
   informere uten å presse fram feil handling.)
6. **Persona.** Beholder vi «Jonas» (samme person som AG-reisen følger), så de to
   reisene henger sammen? Jeg tror ja.

---

## 6. Når vi bygger: foreslått struktur

Speil AG-oppsettet for minst mulig friksjon:

- Egen `journey-data-sykmeldt.ts` med samme `Phase`-type (gjenbruk
  `BarriereKategori` / `MotivasjonsDriver` / `Nudge` fra AG-fila), egne `channels`,
  `persona`, `mission`, `phases`, `overordnetMaal`.
- Gjenbruk `BrukerreiseTospor` / `BrukerreisePresentasjon` / `NudgeCard` /
  `brukerreise.css` med data injisert (evt. la komponentene ta data som prop, så vi
  slipper å duplisere markup).
- Rute: `/brukerreise/sykmeldt` (+ `?modus=presentasjon`), parallelt til
  `/brukerreise/leder`. Lenk begge fra forsiden.
- Først **etter** at vi har sparret punktene i §5.
