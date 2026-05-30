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
