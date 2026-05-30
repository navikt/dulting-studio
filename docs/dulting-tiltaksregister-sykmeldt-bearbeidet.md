# Dulting tiltaksregister — sykmeldt-sporet (bearbeidet)

> **Status:** Bearbeidet tiltaksgrunnlag. Dette er sykmeldt-sporets motstykke til
> arbeidsgiver-bearbeidingen (`src/lib/kidult-reference-model.ts` + AG-registeret),
> kjørt gjennom samme øvelse: råkort → konsoliderte tiltak koblet til **barriere,
> motivasjon, hypotese, dult, EAST/Fogg, FORGOOD, måletegn, guardrail** og merket
> **delt med AG**. Kidult-tavla bearbeidet aldri sykmeldt-siden — dette er den
> manglende øvelsen.
>
> Forankret i:
> - råkort: `docs/dulting-tiltaksregister-sykmeldt.md` (SYK-01..19 + SYK-R1..R4, verbatim)
> - «hvorfor»-laget: `docs/dulting-atferdskartlegging.md` (motivasjon/barriere + KPI)
> - AG-mønsteret: `src/lib/kidult-reference-model.ts`, `docs/dulting-tiltaksregister.md`
> - reise-utkast: `docs/dulting-brukerreise-sykmeldt-utkast.md` (§2 var første utkast til denne)
>
> Illustrativt, syntetisk — ingen reelle personer, saker eller helseopplysninger.

---

## Hvordan lese registeret

Hvert **bearbeidet tiltak** (ST-kode) konsoliderer ett eller flere råkort (SYK-kode)
og bæres av samme feltsett som arbeidsgiver-bearbeidingen:

| Felt | Betydning |
|---|---|
| **Ønsket atferd** | Den konkrete handlingen den sykmeldte skal gjøre lettere/oftere. |
| **Barriere** | Hvorfor de stopper opp i dag. 4 kat.: *Tidspress · Manglende rutiner · Relasjon og tillit · Kunnskapsmangel og uklarhet*. |
| **Motivasjon** | Driveren vi spiller på. 5 drivere: *Autonomi · Identitet · Tilhørighet · Plikt/ytre · Ytre insentiver*. |
| **Hypotese** | «Hvis vi …, så … (fordi …)» — det vi tror dultet utløser. |
| **Dult** | Selve intervensjonen (flate + grep). |
| **EAST/Fogg** | Kvalitative flagg, ikke skår. EAST: *Easy, Attractive, Social, Timely*. Fogg: *Motivation, Ability, Prompt*. |
| **FORGOOD** | Etisk flagg (Nudgelab): det punktet som krever mest varsomhet — typisk *Respect* (ikke presse) eller *Openness* (åpen hensikt). |
| **Måletegn** | Hva vi måler (mange via Lumi på innloggede sider). |
| **Guardrail** | Hvor vi holder igjen for ikke å skade. |
| **Delt med AG** | ✔ = samme touchpoint sett fra to sider (kobles til AG-reisens steg). |

**Rød tråd i hele sporet:** *«Du er sykmeldt fra oppgavene, ikke fra
arbeidsplassen.»* Det er det sterkeste framing-grepet (SYK-12/13) og styrer tonen
overalt. **Gjennomgående etikk:** medvirknings-/aktivitetsplikten er sykmeldtes
motstykke til arbeidsgivers oppfølgingsplikt — alt plikt-språk skal **informere
uten å presse fram feil handling** (workshop: «kun ~30 % gjør det Nav ber om» —
målet er å flytte folk fra ingenting til et minimum, ikke å true).

---

## Dekningskart: råkort → bearbeidet tiltak

| Bearbeidet tiltak | Konsoliderer | Klynge |
|---|---|---|
| ST01 Plikt- og prosessinfo fra dag 1 | SYK-01, SYK-03, SYK-05 | S1 |
| ST02 Oppfordre tidlig kontakt + vis gevinsten | SYK-02, SYK-06 | S1 |
| ST03 Vis hva leder skal gjøre (symmetri) | SYK-04, SYK-R1 | S1 |
| ST04 Tidsriktig signal ~uke 4 | SYK-07, SYK-08 | S2 |
| ST05 Egen behovsvurdering, delbar; ja → AG-varsel | SYK-08, SYK-09, SYK-R3, SYK-R4 | S2 |
| ST06 Kartleggingsspørsmål som ny anledning + skille fra plan | SYK-10, SYK-19 | S2 |
| ST07 Forstå hva en plan er + gevinsten | SYK-11 | S3 |
| ST08 Forberedelsesskjema til samtalen | SYK-12, SYK-14 | S3 |
| ST09 «Sykmeldt fra oppgavene» — medvirkningsrommet | SYK-12, SYK-13 | S3 (+ støttelag) |
| ST10 Sykmeldt medvirker i og deler planen | atferdskort, SYK-R3 | S4 |
| ST11 Evalueringsdato + påminnelse + mal | SYK-15, SYK-16 | S5 |
| ST12 Evalueringsside + flere planer | SYK-17, SYK-18 | S5 |

**Ikke et tiltak — gjennomgående guardrail:** **SYK-R2** (sykmeldingsflaten eies av
et annet team: Symfoni eier sykmeldingen, Flex eier «Ditt sykefravær»). Alt som
krever endring *i selve sykmeldingen* har høyere gjennomføringskostnad — fall heller
tilbake på «Ditt sykefravær» / SMS / bjella der det er mulig.

---

## S1 — Tidlig info, plikt og forståelse
*Sykmeldt-spesifikk inngang (AG har ingen parallell klynge — motstykket der er
klarspråk-støttelaget). Mål: den sykmeldte forstår hva som skjer, egne plikter og
verdien av tidlig dialog — fra dag 1, i lett språk.*
**Klynge-måletegn:** % sykmeldte som forstår egne plikter (Lumi) · besøk på info-/
sykefraværsflate etter sykmelding · andel som tar tidlig kontakt med leder.

### ST01 — Plikt- og prosessinfo fra dag 1
- **Ønsket atferd:** Den sykmeldte kjenner medvirknings-/aktivitetsplikten og vet hva som skjer videre — fra dag 1, ikke først ved evaluering.
- **Barriere:** Kunnskapsmangel og uklarhet — vet ikke hva som forventes eller hva en oppfølgingsplan/dialogmøte er.
- **Motivasjon:** Plikt/ytre — de fleste vil «gjøre det rette» når det er tydelig og lavterskel.
- **Hypotese:** Hvis vi forklarer plikter og prosess i lett språk fra dag 1, så øker andelen som tar tidlig grep, fordi usikkerhet er den største bremsen.
- **Dult:** Microfrontend på nav.no / «Ditt sykefravær»: «hva skjer nå», dine plikter (uten tunge ord), neste steg. Unngå sjargong («dialogmøte 1», «oppfølgingsplan») som rene termer.
- **EAST/Fogg:** Easy (lett språk), Timely / Prompt (dag 1).
- **FORGOOD:** Respect — plikt-info må opplyse, ikke true.
- **Måletegn:** Selvrapportert forståelse av egne plikter (Lumi) · besøk på info-flate etter sykmelding.
- **Guardrail:** Ikke overvelde dag 1; ikke bruk plikt som pisk. SYK-R2: start på «Ditt sykefravær», ikke i selve sykmeldingen.
- **Delt med AG:** –

### ST02 — Oppfordre tidlig kontakt med leder + vis gevinsten
- **Ønsket atferd:** Den sykmeldte tar (eller er åpen for) tidlig kontakt med nærmeste leder.
- **Barriere:** Manglende rutiner — ingenting utløser kontakt; lett å utsette.
- **Motivasjon:** Identitet — «en som tar tak i egen situasjon».
- **Hypotese:** Hvis vi dulter til kontakt og samtidig viser gevinsten, så øker tidlig dialog, fordi folk handler når både *hva* og *hvorfor* er tydelig.
- **Dult:** Dult i «Ditt sykefravær» (under feltene om arbeidsgiver/oppfølging) om å kontakte leder, koblet til budskapet «god dialog → raskere tilbake i jobb og større sjanse til å beholde jobben» (SYK-06).
- **EAST/Fogg:** Attractive (gevinst), Timely.
- **FORGOOD:** Openness — gevinst-budskapet må være ærlig, ikke skremme.
- **Måletegn:** Selvrapportert tidlig kontakt med leder (Lumi) · andel som opplever tidlig kontakt som støtte, ikke press.
- **Guardrail:** Ikke gjør kontakt til et krav; den sykmeldte kan ha gode grunner til å vente.
- **Delt med AG:** ✔ (speiler AG: leder venter ofte på at den ansatte tar kontakt).

### ST03 — Vis hva leder skal gjøre (symmetri og trygghet)
- **Ønsket atferd:** Den sykmeldte forstår leders ansvar, så hele prosessen blir forutsigbar.
- **Barriere:** Kunnskapsmangel og uklarhet — vet ikke hva som skal skje fra arbeidsgivers side.
- **Motivasjon:** Tilhørighet og relasjon — trygghet på at «noen har ansvaret med meg».
- **Hypotese:** Hvis den sykmeldte ser hva leder skal gjøre (symmetrisk info), så reduseres usikkerhet og uro, fordi prosessen blir forutsigbar.
- **Dult:** Vis kort hva arbeidsgiver har fått beskjed om / skal gjøre (speiler AG-varselet), så bildet henger sammen for begge parter.
- **EAST/Fogg:** Social (felles forventning), Easy.
- **FORGOOD:** Fairness — begge parter får samme bilde.
- **Måletegn:** Selvrapportert forståelse av prosessen og av leders rolle (Lumi).
- **Guardrail:** Ikke lov mer om arbeidsgiver enn det vi vet skjer; ikke skap forventninger leder ikke kan innfri.
- **Delt med AG:** ✔ symmetri med AG-reisens steg 01.

---

## S2 — Tidsriktig signal og egen behovsvurdering
*Speiler AG k1 (varsel/frist) + k2 (behovsvurdering), sett fra sykmeldt. Mål: den
sykmeldte tar stilling til behovet for plan rundt uke 4 — på eget initiativ, ikke
bare ved å vente på leder.*
**Klynge-måletegn:** antall egne behovsvurderinger innen uke 4 · andel «ja» som
utløser AG-varsel · respons på SMS/varsel.

### ST04 — Tidsriktig signal ~uke 4
- **Ønsket atferd:** Den sykmeldte blir minnet på, og vurderer behovet for en oppfølgingsplan før/rundt uke 4.
- **Barriere:** Tidspress og prioritering — uten en konkret utløser sklir det.
- **Motivasjon:** Plikt/ytre — en tydelig, tidsriktig anledning gjør plikten håndterbar.
- **Hypotese:** Hvis vi sender et tidsriktig signal ~uke 4 (SMS + pop-up i sykmeldingskvitteringen), så flere tar stilling tidlig, fordi fristen ellers aldri blir synlig i hverdagen.
- **Dult:** SMS/varsel ~uke 4 ved manglende plan, evt. pop-up i kvitteringen etter innsendt sykmelding (SYK-07).
- **EAST/Fogg:** Timely, Prompt.
- **FORGOOD:** Respect — én tidsriktig påminnelse, ikke mas.
- **Måletegn:** Varsel vist/åpnet · andel som vurderer behov innen uke 4 · besøk på flate etter SMS.
- **Guardrail:** Unngå varseltrøtthet og duplikat når plan/vurdering allerede finnes; ikke for tidlig press.
- **Delt med AG:** ✔ (AG-reisens steg 02 tidlig varsel).

### ST05 — Egen behovsvurdering, delbar med Nav; ja → AG-varsel
- **Ønsket atferd:** Den sykmeldte gjør en *egen* vurdering av behovet, kan dele den med Nav, og «ja» utløser et varsel til arbeidsgiver.
- **Barriere:** Manglende rutiner — i dag finnes ingen flate der sykmeldt vurderer behov selv.
- **Motivasjon:** Autonomi og eierskap — å vurdere selv (ikke bare vente på leder) gir eierskap.
- **Hypotese:** Hvis sykmeldt kan gjøre en egen vurdering og «ja» trigger AG, så starter flere planer tidligere, fordi initiativet ikke lenger henger på én part.
- **Dult:** Oppgave i bjella / «Ditt sykefravær» som ber om en kort vurdering; vurderingen kan deles med Nav (og evt. lege); «ja» trigger AG-varsel (SYK-08/09, R3/R4).
- **EAST/Fogg:** Easy, Social (felles signal), Prompt.
- **FORGOOD:** Openness — tydelig hvem som ser vurderingen og hva «ja» utløser.
- **Måletegn:** Antall egne vurderinger · andel «ja» som utløser AG-varsel · andel delt med Nav.
- **Guardrail:** Tydelig samtykke/åpenhet om deling; ingen forhåndsvalgt default; «nei/ikke nå» må være et reelt valg.
- **Delt med AG:** ✔ (AG-reisens steg 03 behovsvurdering; mulig felles vurderingsskjema, jf. AG DULT-16/24).

### ST06 — Kartleggingsspørsmål som ny anledning + skille fra plan
- **Ønsket atferd:** Den sykmeldte bruker kartleggingsspørsmålene (uke ~7) til å vurdere behov på nytt — og forstår at de *ikke* er det samme som en oppfølgingsplan.
- **Barriere:** Kunnskapsmangel og uklarhet — to liknende flater uten tydelig skille skaper forvirring.
- **Motivasjon:** Autonomi — en ny anledning til å ta stilling selv.
- **Hypotese:** Hvis vi bruker kartleggingen som en ny påminnelse *og* forklarer forskjellen tydelig, så øker både ny vurdering og riktig forståelse, fordi uklarheten i dag demper begge.
- **Dult:** Bruk kartleggingsspørsmålene som ny anledning til behovsvurdering (SYK-10), med en tydelig forklaring av forskjellen kartlegging vs. oppfølgingsplan (SYK-19).
- **EAST/Fogg:** Timely, Easy.
- **FORGOOD:** Openness — vær åpen om hva kartleggingen er og ikke er.
- **Måletegn:** Andel som vurderer behov via kartlegging · selvrapportert forståelse av forskjellen (Lumi).
- **Guardrail:** Sterkt geografi-avhengig (pilot Troms og Finnmark) — kan ikke forutsette at alle ser flaten; må ikke bli «enda et skjema».
- **Delt med AG:** – (sykmeldt-spesifikk flate).

---

## S3 — Forstå, forberede og medvirke i planen
*Speiler AG k3 (stegvis planflyt), sett fra sykmeldt. Mål: den sykmeldte forstår
hva en plan er, møter forberedt til samtalen, og ser sitt eget medvirkningsrom.*
**Klynge-måletegn:** visninger av forberedelsesskjema før plan · % sykmeldte som
føler seg ivaretatt ved første samtale (Lumi) · andel planer med sykmeldt-medvirkning.

### ST07 — Forstå hva en plan er + gevinsten
- **Ønsket atferd:** Den sykmeldte forstår hva en oppfølgingsplan er og hvorfor den er nyttig — på et lavere terskelnivå enn i dag.
- **Barriere:** Kunnskapsmangel og uklarhet — planbegrepet oppleves som byråkrati for Nav, ikke støtte.
- **Motivasjon:** Autonomi — forståelse gir eierskap til egen plan.
- **Hypotese:** Hvis den sykmeldte får et enklere verktøy/guide enn i dag, så øker reell medvirkning, fordi terskelen for å delta i planen er kunnskap, ikke vilje.
- **Dult:** Enkel guide/verktøy om hva planen er og gevinsten (SYK-11) — enklere enn dagens.
- **EAST/Fogg:** Easy, Attractive.
- **FORGOOD:** Openness — ærlig om hva planen brukes til og av hvem.
- **Måletegn:** Bruk av guide før plan · selvrapportert forståelse av plan-gevinst (Lumi).
- **Guardrail:** Ikke overforklar eller gjør alt til en veiviser; ikke love mer enn planen leverer.
- **Delt med AG:** – (AG har eget T05 miniguide; dette er sykmeldt-siden).

### ST08 — Forberedelsesskjema til samtalen
- **Ønsket atferd:** Den sykmeldte møter forberedt til samtalen med leder og bidrar reelt.
- **Barriere:** Relasjon og tillit — samtalen er personlig; ung ansatt vil ikke alltid snakke med leder; leder kan være tidligere «kompis».
- **Motivasjon:** Autonomi + Tilhørighet — forberedelse gir trygghet og bedre relasjon.
- **Hypotese:** Hvis sykmeldt får et forberedelsesskjema + samtaleguide, så blir samtalen tryggere og planen mer reell, fordi usikkerhet om «hva sier jeg» er hovedbarrieren.
- **Dult:** Forberedelsesskjema «hva bør du tenke på når du skal lage en plan med lederen din» (SYK-12) + samtaleguide fra idébanken (SYK-14).
- **EAST/Fogg:** Easy, Social, Timely.
- **FORGOOD:** Respect — frivillig hjelp, ikke et nytt krav.
- **Måletegn:** Visninger av forberedelsesskjema før plan · % sykmeldte som føler seg ivaretatt ved første samtale (Lumi).
- **Guardrail:** Ikke be om diagnose eller private forhold; skjemaet er en hjelp, ikke obligatorisk dokumentasjon.
- **Delt med AG:** ✔ (AG-reisens steg 04 samtale og planarbeid).

### ST09 — «Sykmeldt fra oppgavene, ikke arbeidsplassen» (medvirkningsrommet)
- **Ønsket atferd:** Den sykmeldte ser konkrete muligheter for å bidra med *andre* oppgaver mens hen er sykmeldt (medvirkning).
- **Barriere:** Kunnskapsmangel og uklarhet — mange tenker «sykmeldt = borte fra jobb», og ser ikke mulighetsrommet.
- **Motivasjon:** Identitet — fortsatt en bidragsyter, ikke «ute».
- **Hypotese:** Hvis vi framhever «sykmeldt fra oppgavene, ikke arbeidsplassen» med konkrete eksempler, så øker gradert aktivitet/tilrettelegging, fordi framingen åpner et rom folk ikke visste fantes.
- **Dult:** Gjennomgående framing + konkrete eksempler på hva man *kan* gjøre (SYK-12/13); ev. diagnosenøytrale eksempler på tilrettelegging.
- **EAST/Fogg:** Attractive (åpner mulighet), Social (norm).
- **FORGOOD:** Respect + Dignity — aldri presse en syk person til aktivitet hen ikke er i stand til.
- **Måletegn:** Selvrapportert opplevelse av mulighetsrom (Lumi) · (aggregert) gradert sykmelding der tilrettelegging ble prøvd.
- **Guardrail:** Må aldri bli «du burde jobbe mer»; helsen styrer, ikke flaten.
- **Delt med AG:** ✔ (støtter AGs tilretteleggingssamtale) — og **rød tråd i hele sporet / støttelaget**.

---

## S4 — Medvirkning og deling
*Speiler AG k5 (deling), sett fra sykmeldt. Mål: den sykmeldte er en aktiv part i
planen — ikke en passiv mottaker — og kan dele den selv.*
**Klynge-måletegn:** andel planer med sykmeldt-medvirkning · deling med lege/Nav ·
tidlig deling (aggregert).

### ST10 — Sykmeldt medvirker i og deler planen
- **Ønsket atferd:** Den sykmeldte skriver inn/kommenterer i planen, kan be arbeidsgiver lage en plan, og kan dele planen med lege/Nav selv.
- **Barriere:** Manglende rutiner (teknisk) — i den nye planen er det bare arbeidsgiver som skriver; sykmeldt er strukturelt passiv.
- **Motivasjon:** Autonomi og eierskap — reell medvirkning er selve motgiften mot «passiv part».
- **Hypotese:** Hvis sykmeldt kan medvirke asynkront og dele selv, så blir planer rikere og deles tidligere, fordi to parter som kan handle slår én.
- **Dult:** La sykmeldt skrive i / kommentere planen; «be AG lage plan» → AG-oppgave; egen delingsknapp mot lege/Nav (atferdskort, SYK-R3).
- **EAST/Fogg:** Easy, Social.
- **FORGOOD:** Openness + Respect — tydelig hvem som ser hva; deling skal ikke føles som press.
- **Måletegn:** Andel planer med sykmeldt-medvirkning · deling med lege/Nav opp · tidlig deling (aggregert).
- **Guardrail:** Unngå dobbel-varsling når plan allerede er delt; sensitive opplysninger må ikke deles ukritisk; ikke gjør deling til press.
- **Delt med AG:** ✔ (AG-reisens steg 04–05; «be om plan» trigger AG-oppgave).

---

## S5 — Evaluering og kontinuitet
*Speiler AG k4 (evaluering og påminnelse), sett fra sykmeldt. Mål: planen blir et
levende verktøy — evaluert og justert sammen — ikke et engangsdokument.*
**Klynge-måletegn:** andel som faktisk evaluerer · plan åpnet/justert senere ·
rating av tiltak.

### ST11 — Evalueringsdato + påminnelse + mal
- **Ønsket atferd:** Den sykmeldte setter en realistisk evalueringsdato og forbereder seg til evalueringen.
- **Barriere:** Manglende rutiner — ingen påminnelse, ingen recap; datoen forsvinner i hverdagen.
- **Motivasjon:** Plikt/ytre + Autonomi — en konkret avtale gjør oppfølgingen håndterbar.
- **Hypotese:** Hvis datoen får en default + påminnelse + mal for hva man bør ta stilling til, så øker andelen som faktisk evaluerer, fordi friksjonen i dag er «glemt» og «vet ikke hva jeg skal si».
- **Dult:** Default evalueringsdato (4 uker / siste sykmeldingsdag, SYK-15) + påminnelse på innloggede sider med en mal for hva man bør ta stilling til (SYK-16).
- **EAST/Fogg:** Easy (default), Timely / Prompt (påminnelse).
- **FORGOOD:** Respect — opt-in påminnelse, ingen skjult default på varsling.
- **Måletegn:** Evalueringsdato satt · påminnelse valgt · andel som forbereder seg.
- **Guardrail:** Ingen skjult default på selve varslingen; ikke skap ekstra administrasjonsbyrde.
- **Delt med AG:** ✔ (AG-reisens steg 06 evaluering).

### ST12 — Evalueringsside + flere planer
- **Ønsket atferd:** Den sykmeldte markerer hva som virker / er utfordrende, og lager/justerer ny plan ved lengre fravær.
- **Barriere:** Manglende rutiner — planen behandles som et engangsdokument.
- **Motivasjon:** Autonomi og eierskap — en levende, endrbar plan inviterer til å komme tilbake.
- **Hypotese:** Hvis evalueringen er konkret (marker tiltak) og vi normaliserer flere planer, så blir oppfølgingen kontinuerlig, fordi «ingenting er hugget i stein» senker terskelen for å justere.
- **Dult:** Evalueringsside der sykmeldt markerer hvilke tiltak som virker / er utfordrende (SYK-17); oppfordre til flere planer ved lengre fravær (SYK-18).
- **EAST/Fogg:** Easy, Attractive.
- **FORGOOD:** Dignity — unngå dømmende språk; ikke bruk ordet «funket» om noe som ikke gikk.
- **Måletegn:** Rating av tiltak · plan åpnet/justert senere · antall planer i lange forløp.
- **Guardrail:** Ikke gjør flere planer til et krav; unngå skyld-språk når tiltak ikke virket.
- **Delt med AG:** ✔ (AG-reisens steg 06).

---

## Støttelag (gjennomgående, ikke en egen fase)

- **Framing «sykmeldt fra oppgavene, ikke arbeidsplassen»** (ST09) — rød tråd i alle steg.
- **Plikt i klarspråk** — medvirknings-/aktivitetsplikt forklart for å opplyse, ikke true (informere uten å presse fram feil handling).
- **Kartleggingsspørsmål-avklaring** (ST06) — skill alltid kartlegging fra oppfølgingsplan; geografi-pilot, kan ikke forutsettes.
- **SYK-R2-guardrail** — endringer i selve sykmeldingen eies av annet team; fall tilbake på «Ditt sykefravær» / SMS / bjella der mulig.

---

## To-sidige touchpoints (delt med arbeidsgiver-reisen)

Disse må designes som **ett delt touchpoint sett fra to sider**, ikke to uavhengige løp:

| Touchpoint | AG-side (eksisterende reise) | Sykmeldt-side (ST) |
|---|---|---|
| Sykmelding / oppstart | Steg 01 «Sykmelding mottas» | ST02, ST03 (symmetri, tidlig kontakt) |
| Tidlig varsel / behovsvurdering uke 4 | Steg 02–03 | ST04, ST05 (signal + egen vurdering) |
| Samtale + planarbeid | Steg 04 | ST08 (forberedelse), ST09 (medvirkningsrom) |
| Deling med lege/Nav | Steg 05 | ST10 (sykmeldt kan dele selv) |
| Evaluering | Steg 06 | ST11, ST12 |

---

## Åpne spørsmål til bearbeidingen

1. **Felles vurderingsskjema?** ST05 (sykmeldt) og AG DULT-16/24 peker mot samme skjema — bør behovsvurderingen være *én* delt flate sett fra to sider?
2. **Hvem ser sykmeldtes vurdering?** Kun Nav, eller også lege/arbeidsgiver — og når utløses AG-varselet (på «ja», eller alltid)?
3. **Kartleggingsspørsmål (ST06)** — nasjonal utrulling endrer alt; hvor mye skal vi designe for en pilot-flate?
4. **Tone i plikt-språket** — hvor hardt kan vi snakke om medvirknings-/aktivitetsplikt før det tipper fra «informere» til «presse»?
5. **Teknisk medvirkning (ST10)** — hva er faktisk mulig på kort sikt gitt at sykmeldt i dag ikke skriver i planen?
6. **«Sak»/arbeidsflate for sykmeldt** — hører en egen «oppfølging»-underside hjemme på «Ditt sykefravær» (jf. atferdskort), eller holder vi det til AG?

> Reise-spesifikke spørsmål (steg-antall, split-view, persona) ligger i §5 i
> `docs/dulting-brukerreise-sykmeldt-utkast.md`.

---

## Neste steg

1. Strukturert modell: `src/lib/sykmeldt-reference-model.ts` (speiler `kidult-reference-model.ts`, med klyngene S1–S5 + ST-tiltakene over).
2. Visning: sykmeldt-tiltakskart i appen (gjenbruk `.kidult-map*`), rute `/tiltakskart/sykmeldt`, lenket fra AG-tiltakskartet.
3. Sykmeldt-brukerreise (`/brukerreise/sykmeldt`) — **etter** §5-sparringen i reise-utkastet.
