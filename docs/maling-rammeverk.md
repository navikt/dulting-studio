# Måle-rammeverk for tiltakspakke 1 — notat til torsdag

*Utkast 2026-06-02. Til diskusjon i måle-møtet. Dette er arbeids-/kildeversjonen
— litt tett med vilje. Den dedikerte måle-siden i appen skal vise det samme
ryddigere og mindre teknisk (høynivå → lavnivå, segmentert). Tallene i funnelen
er illustrative.*

## Kjernebudskap

**Mål utfall og atferd — ikke tiltakene.** Forankre målingene i KR-ene og i
atferden i brukerreisen, ikke i den enkelte tiltakslista. Da overlever
målesystemet at tiltak stykkes opp annerledes, slås sammen eller forkastes — og
vi slipper å samkjøre vår og NudgeLabs tiltaksliste *før* vi kan måle. Begge
mappes på de samme KR-ene/atferdene.

Vi trenger NudgeLabs tiltak til **ett** formål: for hvert tiltak de går for —
hvilken *én atferd* skal det flytte, og hvilken *KR* lader det opp til? Tiltak
som ikke kan svare på det, er ikke modne nok ennå.

**Om våre interne tiltak-koder (T01/ST05 …):** de hører ikke hjemme i selve
måle-rammeverket eller på måle-siden — der snakker vi KR og atferd. Tiltak-kodene
er et *internt* planleggingsverktøy, bl.a. for å sjekke at planen har én driver
per KR (dekningssjekken i §4). Den sjekken skal *forenes med* NudgeLabs tiltak,
ikke erstatte dem.

## Oppdatert etter grilling (2026-06-03) — overordnede mål + datakilder

**Nordstjerne = O1 (redusert sykefravær via dulting).** Måle-siden fikk en
*virkningskjede* øverst — tre høyder venstre→høyre: **spaker vi rører nå** (tidlig
varsel, behovsvurdering, plan laget/delt, uten å vente) → **mellomliggende mål** (O1
sine høynivå-KR-er: flere/tidligere planer = sikter på nå · ↑ gradert · kortere
fravær = lang horisont · dialogmøte 1 = senere/kun Lumi) → **O1**. Rammet som «dit
vi lader opp, ikke det vi flytter nå». Kun O1 (O2 = intern kompetanse hører til en
team-/porteføljevisning). Koblingen tegnes som ÉN kjede + gruppering, ikke et nett
av piler.

**Mekanisme-måling (Lumi) — kanaria-fuglen.** Hele kjeden hviler på at leder og
sykmeldt møtes tidligere og bedre. Måles via **to Lumi-surveyer (AG + sykmeldt)**:
kom de tidlig i kontakt, opplevdes det som støtte ikke press, fant de tilrettelegging
som funka. Går planene opp UTEN at dette gjør det → papir, ikke dialog.

**Ringvirkning (lang horisont, bekreftende).** Kun **gradert sykmelding +
fraværslengde** — begge hard register, men treg + konfundert, merket «ikke et
runde-1-løfte». Gradert = register-fotavtrykket av at tilrettelegging skjedde
(triangulerer Lumi «fant tilrettelegging som funka»). Omkringliggende produkter
(dialogmøte 2, aktivitetskrav, behovsrettet oppfølging) er **bevisst droppet** — for
langt unna.

**Faktiske datakilde-verktøy (erstatter den generiske §7-listen):**
- **Database** (hard, autoritativt): hele Norges sykmeldinger m/ gradering;
  oppfølgingsplaner fra **Nav + LPS — to apper, to DB-er** (opt-in kan flytte
  plan-laging Nav↔LPS → tell på tvers, ellers falskt frafall + kanal-skift-konfunder);
  veileders forespørsel (→ KR3); **alle varsler per person**; nedstrøms-produkt-data.
- **Umami** (trend/mykt): klikk, navigasjon, valg. Indikativt, ikke til styring;
  kryss-sjekkes mot Lumi (dårlig tilbakemelding ↔ hva de gjorde i løsningen).
- **Lumi** (survey): tillit, opplevd kontakt/press, tilrettelegging, opt-in-opplevelse.
  To surveyer (AG + sykmeldt), fri segmentering.

**Korreksjon — varseltrøtthet er Lumi/opplevd, ikke hard DB.** Vi kan ikke flytte
*objektiv* varseltrøtthet (1 opt-in-varsel = dråpe i havet), og all-varsler-data er
usikker tillatelse. Guardrailen måler derfor **opplevd press (Lumi)**. Og: sykefravær
+ gradert ER hard register-målbart — lang horisont + konfundert, ikke «via lege/ikke nå».

**«Hvorfor» som egen måling + segmentert mekanisme.** NudgeLab vekter *hvorfor* tungt
(EAST: tydelig hvorfor → mer handling). Lagt inn: «forklare hvorfor» som en spake, og
«forstår hvorfor oppfølging er viktig» som en Lumi-måling i mekanisme-laget (ikke på
mellomliggende mål — forståelse er mekanisme, ikke O1-utfall). Mekanisme-laget **kjøres
på alle segmenter inkl. kontroll** og er segment-styrt, så effekten er synlig (flipp til
A). For å *tilskrive* hard-atferd til «hvorfor» må selve hvorfor-forklaringen a/b-testes —
ellers korrelasjon (engasjerte både forstår og handler). **Segment-omfang:** toggle styrer
KPI/trend/mekanisme; funnel viser alle tre; ringvirkning holder pakke-vs-kontroll
(opt-in-splitt = konfunder). **Andre segmenteringer (senere, ikke nå):** virksomhetsstørrelse
(små bedrifter mangler rutiner), gradert vs. full, unge ansatte.

---

## 1. Nivåene

| Nivå | Måler | Datakilde | Rolle |
|---|---|---|---|
| **0 — Effekt** | Redusert sykefravær | Register | Treg, påvirket av mye annet → **bekreftende, ikke en knapp vi styrer på** |
| **1 — KR / utfall** | 5 KR-er, skjerpet til *fullført*: plan laget **og delt** m/ lege ≤ uke 4 / Nav ≤ uke 8 | Register ✓ (sending fanges) | Hovedmålene vi vil flytte |
| **1 — KR3** | Plan «uten å vente»: plan-tid **før** veileders forespørsel | Register ✓ (forespørsel-timestamp) | Proaktivitet |
| **2 — Atferd** | Brukerreisens måletegn per steg | Register/system/Lumi | Broa fra et tiltak til en KR |
| **3 — Adopsjon** | Opt-in valgt, **oppgave/varsel fullført**, påminnelse brukt | Hard fra base; telemetri (visninger) kun som trend | Tidlige signaler |
| **Funnel** | Frafall per steg, samme kohort | Register + per-fravær-kobling | Viser hvor vi mister folk |
| **Tverrgående** | Opplevd press/trakassering · varseltrøtthet · forståelse av plikt/rett | Survey/Lumi + telemetri | Guardrails + opplevelse |

De fem KR-ene: **KR1** flere/tidligere planer · **KR2** stilling til behov ≤ uke 4
· **KR3** plan uten å vente på veileder · **KR4** dialogmøte 1 (ikke i denne
runden / utenfor første pakke — ikke droppet for året) · **KR5** økt gradert /
kortere fravær.

Lovfrister rammeverket henger på: oppfølgingsplan ≤ uke 4 · dialogmøte 1 ≤ uke 7
· aktivitetskrav uke 8.

## 2. Funnelen — ryggraden

Én kohort fulgt over tid (per **fravær/ansatt**, ikke per sykmelding):

```
100 ledere får sykmelding
 → 60 huker av påminnelse        (opt-in, på sykmelding-visningen)
 → 45 lager plan                  (påminnelsen utløses ~uke 4)
 → 40 sender til legen   ≤ uke 4
 → 30 sender til Nav     ≤ uke 8
 → 25 fortsatt aktiv oppfølging
```

Hvert tall er en delmengde av det over. **Frafall = der linja faller mest** —
det er dødsonen dulting skal tette. Krever at vi kan følge samme gruppe gjennom
stegene (telle samme personer/fravær over tid), ikke bare totaler per steg.

## 3. Segmentering & kausalitet — det viktigste

Pakke 1 rulles ut per **region** (Troms og Finnmark først); alle der får hele
pakka. Opt-in-varselet er ett tiltak *inni* pakka — du tilhører pakka selv om du
ikke opter inn. Det gir tre grupper:

- **(A)** ingen pakke (kontroll / resten av landet)
- **(B)** pakke + opt-in
- **(C)** pakke, ikke opt-in

**De tre sammenligningene måler ulike ting:**

- **A vs. pakke (A vs. B+C)** — regionen avgjør pakke, ikke selvvalg →
  **ren årsakssammenheng for hele pakka.** Stol på denne for «virket pakka».
  Forbehold: T&F skiller seg fra resten — bruk før/etter i begge regioner
  (difference-in-differences) eller juster for region-kjennetegn.
- **B vs. C (opt-in vs. ikke)** — **konfundert (seleksjonsskjevhet).** De som
  opter inn er trolig allerede de mest engasjerte lederne, så et gap her er
  *delvis hvem som velger varselet*, ikke varselets effekt. Bruk som signal /
  øvre grense — aldri som «varselet forårsaket X».
- **C vs. A** — antyder effekten av *resten av pakka* (uten varselet).

**Lavnivå-eksempelet ditt, satt opp riktig:** «økning i delte planer til lege
innen uke 4» blir **tre linjer** — A (ingen pakke) vs. C (pakke, ikke opt-in) vs.
B (pakke + opt-in). Gapet A→C er pakka uten varselet; gapet C→B er *forbundet med*
varselet (men konfundert av seleksjon).

**Varselets ekte effekt er vanskeligst å måle.** Mistanken er at det er det
sterkeste enkelttiltaket — men siden opt-in er selvvalgt, kan B vs. C aldri
*bevise* det (seleksjon). Tre veier, i fallende renhet:

- **Opt-out** (default på, lett å takke nei) ville løftet bruken *og* gitt ren
  effekt — men skyver mot appens egen guardrail «ingen skjult default på varsling»
  (T08/ST11), og blir trolig ikke vedtatt. Verdt å *nevne* på torsdag, ikke dø på.
- **Mellomvei (anbefalt hvis opt-in blir stående):** randomiser hvor *fremtredende*
  opt-in-valget er — oppfordringen, ikke defaulten. Den tilfeldige variasjonen i
  oppfordring blir et rent «instrument» for varselets effekt, uten å røre default
  eller samtykke.
- **Ren opt-in uten randomisering:** da må vi være tydelige på at vi *ikke* kan
  isolere varselets effekt rent — B vs. C er signal, ikke bevis.

**Konsekvens:** segmentering (A/B/C) er en akse som kutter gjennom *hele*
funnelen. Hvert nivå-1/2-tall rapporteres som 2–3 linjer oppå hverandre — gapene
mellom linjene er historien. Opt-in-status låses ved steg 1 (før utfallene), så
den er en ren forhånds-variabel å segmentere på.

## 4. Hvilke høynivå-mål kan pakke 1 faktisk påvirke nå?

Fra tiltak→KR-koblingen i utvelgelsen (`krDekning`). *Basert på vårt interne
tiltak-utkast — en dekningssjekk, ikke målestruktur; forenes med NudgeLabs pakke.*
Dette er «hva prøver vi i det hele tatt å flytte i første omgang»:

| KR | Dekning i pakke 1 | Påvirker vi nå? |
|---|---|---|
| **KR1** flere/tidligere planer | Sterk (T01/T03 kjerne + støtte) | **Ja — primær** |
| **KR2** stilling til behov ≤ uke 4 | Sterk (T01/T03 + sykmeldt-speil) | **Ja — primær** |
| **KR3** plan uten å vente | Få interne drivere, men **enkel å måle** (hard data) | **Ja — primær** |
| **KR4** dialogmøte 1 | Ingen — bevisst senere satsing; planen mater inn | **Nei, ikke nå** |
| **KR5** gradert / kortere fravær | Ingen — via H2 (lege); tiltak i «vurder/senere» | **Nei, ikke primært nå** |

Så: pakke 1 sikter realistisk på **KR1 + KR2 + KR3** (KR3 har få interne drivere,
men er enkel å måle og et distinkt signal — verdt å gå for). **KR5** (gradert,
kortere fravær) og selve sykefraværet er *effektmål* vi følger som bekreftelse,
men ikke jager direkte denne runden — det går via legen (H2), som ikke er i pakka.
**KR4** er bevisst utsatt. Dette er verdt å si høyt på torsdag: vi lover ikke
sykefravær ned i runde 1; vi flytter de tidlige plan-atferdene som *lader opp* til
det.

## 5. Hva vi allerede måler i appen (konsolidert)

Målinger ligger spredt på tre lag i koden — de er **samlet her** og følger
nivåene over:

1. **Per brukerreise-steg** (`journey-data.ts` + `…-sykmeldt.ts`) — `primary`
   (atferd/opplevelse) + `proxy` (bruk) + `guardrail`, per steg, begge aktører.
2. **Per tiltak** (`kidult-reference-model.ts` / `sykmeldt-reference-model.ts`,
   vist i tiltak-kortets «Måling og vakt») — ett måletegn + guardrail per tiltak.
3. **Per KR** (`tiltakspakke-utvelgelse-model.ts`) — tiltak→KR, måldekning,
   bang-for-buck.

**Atferds-måletegnene mappet på funnelen** (primære; begge reiser):

| Steg | Arbeidsgiver | Den sykmeldte | Guardrail-tema |
|---|---|---|---|
| 1 Sykmelding | Vet hva som kommer; opplever kontakt som støtte ikke press (Lumi) | Forstår egne plikter (Lumi); tar tidlig kontakt | Ikke hastesak / ikke overvelde dag 1 |
| 2 Tidlig varsel | Stilling tatt/plan startet før frist; **sender uten å vente på veileder** (KR3) | Vurderer behov innen uke 4 | Varseltrøtthet; ikke duplikat når plan finnes |
| 3 Behovsvurdering | Fullført vurdering; fordeling «lag plan / ikke nå»; «ikke nå» med grunn | Egne vurderinger ≤ uke 4; «ja» som utløser AG-varsel; delt med Nav | Ingen default; «ikke nå» ikke snarvei bort fra plikt |
| 4 Samtale/plan | Planstart + planfullføring; leder vet hva han skal snakke om | Føler seg ivaretatt (Lumi); vet hva de kan bidra med | Ikke diagnose/privat fritekst |
| 5 Deling lege/Nav | Plan delt + tidspunkt; tidlig deling før legekontakt (H2, aggr.); gradert der plan delt tidlig | Planer med sykmeldt-medvirkning; deling opp; tidlig deling | Deling ikke press; ikke sensitive opplysninger ukritisk |
| 6 Evaluering | Evalueringsdato + påminnelse valgt; flere som faktisk evaluerer | Samme + rating av tiltak | **Ingen skjult default på varsling**; ikke admin-byrde |

Proxy-er som alt finnes: «varsel vist/åpnet», «besøk på flate etter SMS», «plan
åpnet/justert senere» — bruk, holdt nede som *støtte*, ikke mål.

*Merk:* måletegnene per steg (lag 1) og per tiltak (lag 2) er to litt ulike
kilder for samme ting — verdt å rydde til **én** kanonisk kilde når vi bygger
måle-siden, så vi ikke vedlikeholder to lister.

## 6. Produktlederens innspill — hvor de lander

| Innspill | Nivå | Status |
|---|---|---|
| 1. Plan før uke 4 + sendt til legen | 1 (KR1, fullført) | Register ✓ (sending fanges) |
| 2. Plan innen 8 uker + sendt til Nav | 1 (KR1, fullført) | Register ✓ |
| 3. Vurdert plan + delt info | 1–2 (KR2 + deling) | «Delt info» = avklar (se beslutninger) |
| 4. Bruk av påminnelse | 3 (adopsjon) | Base/hard ✓ (oppgave fullført) |
| 5. Flere planer per ansatt | utforskende | Trenger retning (se §8) |
| 6. Frafall etter oppstart | Funnel | Bygges (per-fravær-kohort) |

## 7. Datakilder (bekreftet)

- **Hard data (register + base):** plan laget, tidspunkt, sending til lege/Nav,
  veileders forespørsel (→ KR3), **opt-in valgt, oppgave/varsel fullført**, antall
  planer per fravær, funnel-kohort. Det autoritative laget.
- **Telemetri (mykt/trend):** visninger og åpninger. Indikativt — ikke
  autoritativt, ikke til styring.
- **Survey/Lumi:** forståelse av plikt/rettigheter, opplevd press/støtte,
  «ivaretatt»-opplevelse (guardrails + opplevelse).

## 8. Utforskende — andre ting verdt å måle (ikke besluttet)

En liten backlog å ta stilling til, ikke vedta nå:

- **Tiltak uten måletegn:** T02, T04, T09, T14 (+ T13 har kun guardrail) mangler
  et atferdsmåletegn → ikke målbare ennå. Bør få ett eller slås sammen.
- **«Levende plan» (knytter til PL #5):** hvis planen blir et levende dokument —
  oppdateringsfrekvens, gjenbruk, antall planer i lange forløp. Sett *retning*
  først (levende = bra vs. omstart = dårlig).
- **Forståelse av rettigheter/unntak** (workshop-hullet «AG vet ikke hva ansatt
  får fra Nav», = «delt info»-lesning B): forstår leder hva den ansatte får?
  Survey + evt. «info vist»-telemetri.
- **Varseltrøtthet som målt størrelse:** avmeldinger, ignorerte varsel, opt-out
  av påminnelse — guardrailen gjort målbar.
- **Opt-out-eksperiment** for varselet (fra §3) — den reneste veien til varselets
  effekt.
- **Sykmeldt-medvirkning** (ST05 toveis, «medvirke/dele plan» er teknisk blokkert
  i dag) — måles først når besluttet og bygd.
- **Lang-kobling KR5/H2:** plan delt tidlig → vurdert gradert → kortere fravær.
  Krever lege-leddet; en hypotese å verifisere senere, ikke et runde-1-mål.

## 9. Åpne beslutninger for torsdag

1. **Opt-in vs. opt-out for varselet** — og om vi randomiserer for ren effekt.
   Største avgjørelse; veies mot eksisterende «ingen skjult default»-guardrail.
2. **«Delt info» (PL #3)** — deling av *planen* (register) eller *info om
   rettigheter/unntak* (telemetri + survey)? Vi kan måle begge.
3. **«Flere planer per ansatt» (PL #5)** — sett retning før den blir en KR.
4. **KR3 — måler vi gjerne (enkel, hard data); spørsmålet er driverne.** «Plan uten
   å vente» er et distinkt signal og lett målbart, så det blir primært uansett.
   Åpent: godtar vi proaktivitet som biprodukt av T01/T03, eller fortjener den et
   eget grep?
5. **Region-kontroll** — bekreft diff-in-diff (før/etter i T&F vs. resten).

## Prinsipper

1. **Styr etter atferd (nivå 2) + tidlige signaler (nivå 3)** for rask læring;
   sykefravær (nivå 0) er en treg bekreftelse vi *ikke* styrer etter uke for uke.
2. **Hvert primærmål får et forkastingskriterium definert FØR eksperimentet** +
   en guardrail.
3. **Skill hard data fra survey bevisst:** register = *hva skjedde*; survey =
   *forstod de plikten / følte de seg presset*.
4. **Segmenter alltid (A/B/C)** — uten det er hvert annet tall konfundert av
   opt-in-seleksjon.
