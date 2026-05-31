# Kalibrering — innhold som krever produkteiers signatur

> **Formål:** alt jeg (AI) har utledet eller antatt og som du må bekrefte/korrigere
> før det kan stå som «sant». Vi går gjennom dette sammen i en kalibreringsøkt.
> Til da er de berørte feltene merket «utkast» i appen, og den uvaliderte
> berikelsen er **ikke deployet**.
>
> **Status:** opprettet 2026-05-30. Tirsdag = presentasjon av **hele brukerreisen
> (arbeidsgiver _og_ sykmeldt)** for kjerneteamet, sammenlignet mot Nudgelabs
> håndlagde (trolig horisontal Mural + barriere/motivasjon som separat artefakt).
>
> **Hvordan bruke:** gå gjennom punktene; sett ✅ (godkjent) / ✏️ (endre — skriv
> hva) / ❌ (feil). Alt med ⚠️ er der jeg er minst sikker.

---

## ✅ Signert i kalibrering 2026-05-31

- **D · Forside:** ✅ godkjent som balansert (begge plikter sidestilt, «sammen»
  som primær inngang, likestilte spor-lenker). Beholdes.
- **D · Scrollytelling:** ✅ beholdes de-emfasert (forside-CTA fjernet, ruta/koden
  består). Ikke synlig inngang tirsdag, lett å hente fram.
- **C2 · Pakke 1:** ✅ bekreftet som utgangspunkt — AG T01–T04 (+T13 støtte),
  sykmeldt ST04–ST05 (+ST01), samlet om «tidlig signal + behovsvurdering før uke 4».
- **C1 · Effekt/innsats:** 🔄 påbegynt — taksonomi tatt først (se §F), post-merge-skår gjenstår.
- **F · Taksonomi:** ✅ T01+T02 slått sammen · T04→T03 · T08+T09 slått sammen ·
  ST01 progressiv · ST05→«vurder» (asymmetrisk signal) · ST03 effekt 1→2 (detaljer i §F).

---

## 🔜 Gjenstår å kalibrere (prioritert) — rask runde når du er tilbake

Hver har min anbefaling forhåndsutfylt — bekreft (✅) eller korriger (✏️).

1. ✅ **T01\* primær-barriere:** Manglende rutiner primær + Tidspress sekundær (avklart 2026-05-31).
2. ✅ **Effekt/innsats post-merge bekreftet** (2026-05-31). Endringer: T05→E1 (stegvis-plan
   premiss faller; miniguide skilt ut til T13/ST07), T07 E1 bekreftet. Resten står.
3. ✅ **AG A1 barriere×motivasjon bekreftet** (2026-05-31). Endringer: T01\*→Manglende rutiner,
   T05→Kunnskapsmangel (var Relasjon/tillit), T08\*→Manglende rutiner / **Tilhørighet**. Resten står.
4. ✅ **EAST/Fogg + FORGOOD:** stol på utkastene nå (merket «utkast»); FORGOOD-vakter er
   konservative. Revider EAST/Fogg etter tirsdag (2026-05-31).
5. ✅ **Frist = «senest innen uke 4»** (juridisk korrekt for plan + deling med lege).
   «Uke 8» lagt bort. + **Ekstern varsling = eksplisitt målbart valg** (se §F4).
6. ✅ **Sykmeldt ST06–ST12 bekreftet** (2026-05-31). ST09 = Identitet og rolle (primær,
   toucher Tilhørighet). Resten står. NB: barriere×motivasjon = analyse/forklaringslag
   (matrise-plassering + why-tag), endrer ikke dulten — lav-stakes. ST07 = hjem for
   miniguiden (fra T05); ST10 = «be om plan»-knappen (knyttet til ST05-fork).
7. ✅ **Implementert** (2026-05-31). Mergene foldet inn i `kidult-reference-model.ts`,
   `tiltakspakke-utvelgelse-model.ts`, `sykmeldt-reference-model.ts` + ref-tags i
   `journey-data.ts`. AG-lista 14→11 tiltak. Verifisert: lint 0 feil, 232 tester, build,
   + Playwright på tiltakskart/utvelgelse/leder/sammen (0 konsollfeil, alt rendrer). Deployet.

---

## A. Arbeidsgiver (T01–T14) — NY berikelse (ikke deployet)

Jeg utvidet AG-tiltakskartet til samme rikdom som sykmeldt: hvert tiltak fikk
barriere, motivasjon, dult, EAST/Fogg, FORGOOD og råkort. Grunnlag:
- **barriere/motivasjon** = arvet fra steget tiltaket hører til i `lederJourney`.
- **råkort** = fra dekningskartet i `docs/dulting-tiltaksregister.md`.
- **dult/måletegn** = fra eksisterende `description`/`signal`.
- **EAST/Fogg + FORGOOD** = ⚠️ kvalitative utkast jeg skrev — trenger din dom.

### A1. Barriere × motivasjon per AG-tiltak (bekreft hver rad)

| Tiltak | Barriere (utkast) | Motivasjon (utkast) | Merk |
|---|---|---|---|
| T01 Varsel før uke 4 | Tidspress og prioritering | Plikt og ytre forventninger | |
| T02 Frist på riktig person | Manglende rutiner | Plikt og ytre forventninger | ⚠️ rutiner vs tidspress? |
| T03 Personnær vurderingsoppgave | Kunnskapsmangel og uklarhet | Autonomi og eierskap | |
| T04 Plan trengs ikke nå | Kunnskapsmangel og uklarhet | Autonomi og eierskap | |
| T05 Miniguide og stegvis plan | Relasjon og tillit | Tilhørighet og relasjon | ⚠️ eller Kunnskapsmangel? |
| T06 Aktiv plan kan justeres | Manglende rutiner | Autonomi og eierskap | |
| T07 Utkast og fremdrift | Tidspress og prioritering | Autonomi og eierskap | |
| T08 Evalueringsdato som ny samtale | Manglende rutiner | Tilhørighet og relasjon | ⚠️ motivasjon usikker |
| T09 Kalender + opt-in påminnelse | Tidspress og prioritering | Autonomi og eierskap | |
| T10 Hvorfor dele med lege/Nav | Kunnskapsmangel og uklarhet | Plikt og ytre forventninger | |
| T11 Tilrettelegging virker/ikke | Kunnskapsmangel og uklarhet | Autonomi og eierskap | |
| T12 Lagring og gjenbruk | Kunnskapsmangel og uklarhet | Plikt og ytre forventninger | |

### A2. EAST/Fogg + FORGOOD per tiltak ⚠️
Jeg skrev ett kort EAST/Fogg-flagg og ett FORGOOD-flagg per T01–T12 (se
`src/lib/kidult-reference-model.ts`). Disse er de mest «gjettede» — gå raskt
gjennom og korriger der de ikke stemmer med teamets vokabular/vurdering.

### A3. Råkort-kobling
Stort sett fra dekningskartet, men: **T11 har ingen direkte råkort** (avledet i
bearbeidingen) — ok? Og **T13/T14 (støttelag) er ikke beriket** — skal de få
samme behandling, eller forblir de støtte-tags?

### A4. AG-innhold ellers
- **4-ukers-fristen:** står som «oppfølgingsplan senest innen uke 4» (juridisk
  korrekt), men avviker fra workshop-kortets ordlyd «uke 4, senest uke 8». Beholde?
- `sharedWithSykmeldt`-markørene (T01/T03/T05) — stemmer touchpoint-koblingene?

---

## B. Sykmeldt (ST01–ST12) — bygd, trenger validering

Bygd fra `docs/dulting-tiltaksregister-sykmeldt-bearbeidet.md`. Hvert tiltak har
barriere/motivasjon/dult/EAST-Fogg/FORGOOD/måletegn/guardrail. Disse ble laget
av meg fra råkortene — du har ikke signert dem ennå.

### B1. Gå gjennom ST01–ST12 (`src/lib/sykmeldt-reference-model.ts`)
Spesielt: er barriere/motivasjon riktig per tiltak, og er **dult-formuleringene**
noe du kan stå inne for fag- og tonemessig?

### B2. Åpne spørsmål fra modellen (`sykmeldtOpenQuestions`)
1. Felles vurderingsskjema? ST05 (sykmeldt) + AG DULT-16/24 → samme flate, to sider?
2. Hvem ser sykmeldtes vurdering (kun Nav, eller lege/AG) — og når utløses AG-varselet (på «ja», eller alltid)?
3. Kartleggingsspørsmål: nasjonal utrulling endrer alt — hvor mye designe for pilot?
4. Tone i plikt-språket: hvor hardt før det tipper fra «informere» til «presse»?
5. Teknisk medvirkning (ST10): hva er faktisk mulig på kort sikt?

### B3. ST05 (toveis kobling)
Flagget tidligere: skal ST05 være **låst kjerne** i pakke 1 før samtykke/trigger
er avklart? Og bør ST03 («dette ser AG») inn for symmetri?

---

## C. Tiltakspakke-utvelgelse (`/tiltakspakke-utvelgelse`)

### C1. Effekt/innsats-tallene ⚠️ (allerede merket utkast i UI)
Alle 26 tiltak har effekt (1–3) og innsats (1–3) satt av meg fra docs. **Ikke
validert.** Dette er kjernen i «gjør først»-sorteringen — må kalibreres med teamet.
(Editoren `/tiltakspakke-utvelgelse/rediger` finnes nettopp for dette.)

### C2. Forslag til pakke 1 (utkast)
- AG kjerne: **T01, T02, T03, T04** + støtte **T13**
- Sykmeldt kjerne: **ST04, ST05** + støtte **ST01**
- Samlet om «tidlig signal + behovsvurdering før uke 4, begge sider».
- Bekreft: er dette pakke 1, eller skal noe ut/inn? (`pakke1Ramme` gjør sykmeldt-
  utvidelsen til en bevisst beslutning — godkjenn eller juster.)

### C3. tier-plassering
Hvert tiltak er `pakke1 | vurder | senere`. Gå gjennom at plasseringene stemmer.

---

## D. IA / forside / scrollytelling — beslutninger jeg har tatt (godkjenn/avvis)

- **Forside balansert (utkast):** likestiller medvirknings- + tilretteleggingsplikt,
  likestilte lenker til leder- og sykmeldt-reisen, «sammen» løftet fram. Var
  AG-ledet. → Se eget skjermbilde.
- **Scrollytelling de-emfasert:** fjernet «Presentasjonsmodus»-lenken fra forsiden
  for å minimere det som ikke skal presenteres tirsdag. **Ruta/koden består**
  (`?modus=presentasjon`, nåbar + in-page-toggle beholdt) — lett å hente tilbake.
  Begrunnelse: tirsdag-publikum = kjerneteam som skal granske substans, ikke jury;
  tospor-visningen er eple-mot-eple mot Nudgelabs Mural. Si fra hvis du vil ha den
  helt vekk eller helt tilbake.

---

## E. Tirsdag — strategi (bekreft)

- **Vår styrke vs Nudgelab:** de viser trolig reisen som horisontal Mural + barriere/
  motivasjon som *separat* artefakt. Vår forskjell = why-laget er **integrert i hvert
  steg** + sporene er **koblet** (`/brukerreise/sammen`). Det er «hva AI/verktøyet
  fikk til». Bør være hovedpoenget i framføringen.
- **Hovedartefakt:** tospor (oppslått, skannbart, why-lag synlig) — ikke scrollytelling.
- Åpne spørsmål om AG-reisens 7 «lov-ideal»-steg vs faktisk praksis (behold kritisk).

---

## F. Tiltaks-taksonomi — kalibrert 2026-05-31 (live med produkteier)

Produkteier utfordret om tiltakene er over-oppdelt. Felles ramme vi jobber ut fra:
*et varsel er i bunn én oppgave/beskjed på en flate (Dine sykmeldte / Ditt
sykefravær), med eller uten ekstern push (SMS/e-post). Da blir flere «tiltak»
heller parametere på samme objekt.*

- **T01 + T02 → SLÅS SAMMEN** ✅ (2026-05-31). Ett tiltak: «tidsriktig oppgave på
  riktig person før uke 4, med frist». Ekstern varsling (SMS/e-post) og eksakt uke
  blir parametere, ikke egne tiltak. (Oppdater `kidult-reference-model.ts` +
  `tiltakspakke-utvelgelse-model.ts` etter at hele taksonomien er avklart.)
- **T03 + T04 → T04 slås inn i T03** ✅ (2026-05-31). T03 = «ta stilling: ja → lag
  plan / nei → registrer med grunn». «Nei»-grenen er en utgang av beslutningspunktet,
  ikke et eget tiltak. Den etiske vakten («ikke en snarvei bort fra plikten», ingen
  default) beholdes synlig på det samlede tiltaket.
- **T08 + T09 → SLÅS SAMMEN** ✅ (2026-05-31). «Sett evalueringsdato + opt-in
  påminnelse (kalender)». Påminnelsen er det som gjør datoen til atferd — uten den
  er datoen tom. Opt-in / ingen skjult default = parameter. (Steg 4 / etter «muren»
  — uansett ikke kjernen i pakke 1.)
- **ST01 → PROGRESSIV** ✅ (2026-05-31). Lett, hjelp-først og *pull* dag 1
  (rettigheter / hva skjer videre); tydeligere plikt-/prosess-lag først når fraværet
  faktisk strekker seg mot uke 4. Ingen ekstern push. Treffer de som blir værende
  uten å mase på de som blir friske selv. (Flate-eierskap Flex «Ditt sykefravær» /
  Symfoni fortsatt åpent.) Justér ST01s `description`/tone i `sykmeldt-reference-model.ts`.
- **ST05 → «VURDER», ikke låst kjerne** ✅ (2026-05-31). **Modellen korrigert av
  produkteier:** AG eier planen; i dagens løsning kan KUN AG lage plan, sykmeldt har
  read-only etter deling. Pågående bygg: «be om plan»-knapp for sykmeldt → varsel til
  leder. ST05 reframes fra *symmetrisk parallell vurdering* til **asymmetrisk
  signal/forespørsel**: sykmeldt ber/signaliserer, AG bestemmer og eier.
  - **Åpent designspørsmål til teamet — uenighet:** kun ruten *sykmeldt ja / AG nei*
    er vanskelig. Prinsipp: sykmeldts forespørsel skal være SYNLIG for AG og ikke
    kunne ignoreres stille (= «makten» til sykmeldt); AGs «nei» på en aktiv forespørsel
    bør kreve registrert grunn (jf. T03/T04-logikk). *Sykmeldt nei / AG ja*: AG eier
    plikten, kan lage plan likevel; sykmeldts «nei» er innspill, ikke veto.
  - **Nav/lege-innsyn** = samtykke-spørsmålet (uendret).
  - **ST03 «dette ser AG»** = synlighetslaget som gir signalet tenner → vurder å løfte
    ST03 sammen med ST05 (symmetri).
  - **Strategisk fork (produkteier reiste, uavklart): hvor bor behovsvurderingen?**
    - *A — «be om plan»-knapp:* alltid-på, reaktiv. Her oppstår sekvens-spørsmålene
      (hvem svarer først, kan leder ombestemme seg, forsvinner sykmeldts valg).
    - *B — standard uke-4-løype:* behovsvurderingen bakt inn i uke-4-touchpointen for
      begge parter — ikke en knapp, en del av flyten alle treffer.
    - **Anbefaling: B som ryggrad, knappen som off-cycle/tidlig rute** (sykmeldt trenger
      plan før uke 4). B faller sammen med hele tesen (uke 4 = «muren», der AG-siden
      T01–T03 konvergerer, og det `sammen` viser). B oppløser edge-casene: begge promptes
      i samme vindu (ikke race), begge svar PERSISTERER + synlige (ingen forsvinner),
      leder kan endre til plan er ferdigstilt. **ÅPENT — team/roadmap, ikke låst i kalibrering.**
- **ST03 → effekt 1→2** ✅ (2026-05-31). «Vis sykmeldt hva leder skal gjøre» var
  undervurdert: å vite leders ansvar/frist gir sykmeldt trygghet + brekkstang til å
  purre (passer «mer makt til sykmeldt»). Symmetri holdes én vei nå (sykmeldt ser
  leders rolle); motsatt vei (AG ser sykmeldts signal) ligger i ST05-tråden, ikke
  løftet som eget tiltak ennå.

### F2. AG-liste etter sammenslåing — effekt/innsats re-skåret

Etter mergene krymper AG-lista fra 14 → 11 tiltak. Skårene er ellers stabile fra
første gjennomgang; det er de tre sammenslåtte som trenger ny bekreftelse:

| ID | Tiltak (post-merge) | E | I | Tier | Merk |
|----|---------------------|---|---|------|------|
| T01* | Tidsriktig oppgave på riktig person før uke 4 (T01+T02) | 3 | 2 | pakke1 kjerne | Barriere: **Manglende rutiner** primær + Tidspress sekundær ✅ |
| T03* | Personnær vurderingsoppgave m/ «nei»-gren (T03+T04) | 3 | 2 | pakke1 kjerne | Kunnskapsmangel / Autonomi |
| T05 | Stegvis plan (miniguide skilt ut) | **1** | **2** | senere | ✅ premiss (frafall) holder ikke. Miniguide/klarspråk → info-laget T13 (leder) + ST07 (sykmeldt), kan ligge utenfor planen |
| T06 | Aktiv plan kan justeres | 2 | 2 | senere | |
| T07 | Utkast og fremdrift | 1 | 2 | senere | ✅ E1 bekreftet — premiss (frafall under utfylling) ikke observert |
| T08* | Evalueringsdato + opt-in påminnelse (T08+T09) | 2 | 2 | vurder | Tier var split vurder/senere |
| T10 | Hvorfor dele med lege/Nav | 2 | 1 | vurder | |
| T11 | Tilrettelegging virker/ikke | 2 | 2 | senere | |
| T12 | Lagring og gjenbruk av plan | 1 | 2 | senere | |
| T13 | Verdi og plikt i klarspråk (støtte) | 2 | 1 | pakke1 støtte | |
| T14 | Samlet innhold + begrepsrydding | 2 | 3 | senere | |

### F3. Sykmeldt-liste — effekt/innsats etter kalibrering

Ingen merger på sykmeldt-siden; bare ST03 (effekt) og ST05 (tier) flyttet seg.

| ID | Tiltak | E | I | Tier | Merk |
|----|--------|---|---|------|------|
| ST01 | Plikt-/prosessinfo dag 1 (progressiv) | 2 | 2 | pakke1 støtte | tone/timing → progressiv ✅ |
| ST02 | Oppfordre tidlig kontakt + gevinst | 2 | 1 | vurder | |
| ST03 | Vis hva leder skal gjøre (symmetri) | **2** | 1 | vurder | effekt 1→2 ✅ |
| ST04 | Tidsriktig signal ~uke 4 | 3 | 2 | pakke1 kjerne | |
| ST05 | Egen behovsvurdering; ja→AG-varsel | 3 | 3 | **vurder** | flyttet pakke1→vurder ✅ (asymmetrisk; team/roadmap) |
| ST06 | Kartleggingsspørsmål som ny anledning | 2 | 3 | senere | blokkert: geografi-pilot |
| ST07 | Forstå hva en plan er + gevinst | 2 | 1 | vurder | |
| ST08 | Forberedelsesskjema til samtalen | 2 | 2 | senere | |
| ST09 | «Sykmeldt fra oppgavene» | 2 | 1 | vurder | |
| ST10 | Sykmeldt medvirker + deler planen | 3 | 3 | senere | teknisk blokkert |
| ST11 | Evalueringsdato + påminnelse + mal | 2 | 1 | vurder | |
| ST12 | Evalueringsside + flere planer | 2 | 2 | senere | |

> **Konsekvens for pakke 1 (oppdater §C2):** ST05 er flyttet fra *kjerne* til *vurder*.
> Pakke 1 sykmeldt-side blir da **ST04 kjerne + ST01 støtte**; ST05 (det toveis grepet)
> er nå en bevisst, betinget utvidelse, ikke låst kjerne — i tråd med kalibreringen.
> AG-side pakke 1 (post-merge): **T01\* + T03\* kjerne + T13 støtte.**

### F4. Ekstern varsling (SMS/e-post) — eksplisitt målbart valg, ikke baket inn ✅ (2026-05-31)

Team-strid: produktleder skeptisk til tidlig push (mange blir friske selv; vil motivere,
ikke presse). Flere (inkl. produkteier) mener de ikke trekker nok folk tidsnok uten
ekstern varsel. Begge legitime — løses ikke på mening, men på måling.

**Beslutning:** verktøyet baker IKKE inn et svar. Push/ikke-push presenteres som et åpent,
målbart designvalg (parameter på T01\*; gjelder også sykmeldt-siden / ST01):
- **Primært måletegn (rekkevidde):** trekker vi nok folk tidsnok? — andel saker med
  oppfølging i gang før uke 4; andel som handler på signalet.
- **Guardrail (press):** opplevd «masete»/kjipt — kort opplevelsesmål, opt-out-/avvisningsrate, klager.
- **Eksperiment:** start pull (ingen push), mål rekkevidde; er den for lav → test ekstern
  push på én kohort, mål *både* rekkevidde-løft *og* opplevd press. Empirisk, ikke mening.

«Informere, ikke presse» gjort operasjonelt. **Sterk samlende sak for tirsdag.**
Konsekvens: ST01 (pull, besluttet) og T01\* står ikke i motstrid — pull er startpunktet,
ekstern push er den målbare hypotesen man evt. tester oppå.

---

## G. KR-kobling + bang-for-buck (NY i verktøyet 2026-05-31) — utkast til kalibrering

Bygd: utvelgelsen har nå en **«Prioritering: bang for the buck × måldekning»**-seksjon:
- **Bang for the buck** = effekt ÷ innsats per tiltak (rangert, synkende).
- **KR-kobling** (`tiltakKr` i `tiltakspakke-utvelgelse-model.ts`): hvilke av de 5 KR-ene
  hvert tiltak ladrer opp til. ⚠️ **UTKAST — må kalibreres som effekt/innsats.**
- **Måldekning**: per KR, hva pakke 1 dekker vs hull.

**Funn (AG-sporet):** pakke 1 dekker solid **KR1** (flere/tidligere planer), **KR2** (stilling
til behov ≤ uke 4) og **KR3** (plan uten å vente). **KR4 (dialogmøte 1) er kalibrert tom**
(dialogmøte = egen satsing senere, ute av scope), og **KR5 (gradert sykmelding) ligger utenfor
pakke 1.** KR5/gradert nås via **H2/lege** (T10, T11, ST05, ST10) — alle i «vurder/senere».
→ **Bevisst valg teamet bør veie tirsdag:** er det riktig at pakke 1 ikke rører gradert/lege,
gitt at gradert er en topp-KR? (Produktleder: lege ikke primær bruker nå. Verktøyet viser nå
koblingen eksplisitt så teamet kan veie den bevisst — ikke skjule den.)

**✅ KR-kobling kalibrert (2026-05-31):** KR4 satt tom (T08/ST08/ST11 er kontinuitet/prep uten
KR nå — ingen tiltak treffer dialogmøtet direkte). ST09 tatt av KR5 (identitet/medvirkning, ikke
direkte gradert). Resten av `tiltakKr`-mappingen bekreftet rad for rad.
