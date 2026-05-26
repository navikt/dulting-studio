# Dulting tiltaksregister

> **Status**: Dette er en første redaksjonell sortering og arbeidsmodell, ikke
> en endelig landet tiltakspakke. Hver tiltaksklynge må avklares mot intensjon,
> minimumsløsning, risiko og måling før første test.

Dette dokumentet viser alle råkortene fra dulting-raden for
**arbeidsgiver-sporet** (Dine sykmeldte / oppfølgingsplan). Sykmeldt-sporet er
ikke gjennomgått og er ikke med i dette registeret.

Registeret viser hva vi tror intensjonen er, hvem tiltaket retter seg mot, og
hvordan hvert kort er mappet til tiltaksklynger. Mural er arbeidsflaten for
oversikt og sortering. Dette registeret er stedet for å grave i bakgrunn og
sporbarhet.

## Begreper

| Begrep | Betydning |
|---|---|
| DULT-* | Råkort eller dult-forslag fra dulting-raden. Dette er foreløpige forslag, ikke ferdig besluttede tiltak. |
| Tiltak | En handling som kan påvirke atferd. Et DULT-råkort er et forslag til tiltak. Etter bearbeiding kan det bli et kanonisk tiltak i en tiltakspakke. |
| Aktør | Hvem tiltaket primært retter seg mot: arbeidsgiver, sykmeldt, begge eller ukjent. |
| Tiltaksklynge | Gruppe av tiltak som hører sammen funksjonelt eller atferdsmessig. |
| Tiltakspakke | Samlet pakke av mange tiltak, klynger, målinger og avklaringer. |
| Ønsket atferd | Hva arbeidsgiver skal gjøre annerledes hvis klyngen virker. |
| Målepåvirkning | Hvordan vi tror klyngen påvirker atferd og effektmål. Måles først på nærliggende handlinger, deretter på oppfølgingsplaner som kommer inn. |
| Guardrails | Uønskede bieffekter vi må følge med på, for eksempel snarvei bort fra oppfølgingsplikt eller helseopplysninger i fritekst. |
| Åpne spørsmål | Avklaringer som må løses før første test eller implementering. |
| «Plan trengs ikke nå» | Arbeidsnavn for et mulig utfall i behovsvurderingen. Det er ikke en endelig konklusjon og må ikke undergrave arbeidsgivers oppfølgingsplikt. |
| Status | Viser om kortet er med i første test, støtte, avklaring, senere, utenfor første pakke, kontekst eller ute. |

### Statusverdier

| Status | Betydning |
|---|---|
| Med i første test | Kortet inngår som egen del av første testpakke. |
| Støtte | Kortet er ikke en egen testbar enhet, men bør inn hvis berørt skjerm eller flyt endres. |
| Avklaring | Kortet krever juridisk, faglig, teknisk eller datamessig avklaring før det kan bli tiltak. |
| Senere | Aktuelt etter første test eller i en senere tiltakspakke. |
| Utenfor første pakke | Relevant bakgrunns- eller grunnarbeid, men ikke del av første test. |
| Kontekst | Bakgrunn eller premiss, ikke selvstendig tiltak. |
| Ute | Ikke tiltak eller ikke relevant for første pakke. |

## Tiltaksklynger

| Tiltaksklynge | Beskrivelse |
|---|---|
| Tidsriktig signal | Tiltak som gjør arbeidsgiver oppmerksom når oppfølgingsplan bør vurderes. |
| Behovsvurdering i Dine sykmeldte | Tiltak som gjør passiv informasjon til konkret vurdering og handling. |
| Støttende tekst og forståelse | Tiltak som forklarer verdi, plikt og ansvar. |
| Stegvis hjelp i planflyt | Tiltak som hjelper arbeidsgiver videre etter at planarbeidet er startet. |
| Evaluering og påminnelser | Tiltak for kontinuitet etter plan eller før ny oppfølging. |
| Innhold og IA | Innholds- og informasjonsarkitektur som støtter tiltak, men ikke er egen dult nå. |
| Tekst og skjermrydding | Språk- og UI-forbedringer som bør håndteres når relevant skjerm røres. |
| Avklaring | Juridisk, faglig eller teknisk avklaring før tiltaket kan vurderes. |
| Utenfor første pakke | Meta, kontekst eller lavprioritert arbeid som ikke tas inn nå. |

## Råkort og mapping

| DULT-ID | Råkort | Intensjon | Aktør | Tiltaksklynge | Status | Kommentar |
|---|---|---|---|---|---|---|
| DULT-01 | Kartlegge behov for oppfølgingsplan | Arbeidsgiver vurderer om oppfølgingsplan er nødvendig. | Arbeidsgiver | Behovsvurdering i Dine sykmeldte | Med i første test | Kjerne i behovsvurderingen. |
| DULT-02 | En kort tekst som sier noe om verdien ved å følge opp sine sykmeldte | Arbeidsgiver forstår hvorfor oppfølging er verdifullt. | Arbeidsgiver | Støttende tekst og forståelse | Støtte | Bør inn som mikrotekst i signal eller behovsvurdering. |
| DULT-03 | Samle godt innhold knyttet til tilrettelegging og oppfølging. Ligger spredt og skjult i dag | Arbeidsgiver finner relevant innhold samlet. | Arbeidsgiver | Innhold og IA | Utenfor første pakke | Viktig grunnarbeid, men ikke egen dult i første test. |
| DULT-04 | Det finnes et felt i sykmeldingen som heter "beskjed til arbeidsgiver" Kan vi fremheve meldinger fra legen til arbeidsgiver i sykmeldingen når arbeidsgiver mottar den? Eventuelt dulte dem til oppfølgingsplanen hvis legen har skrevet noe til dem. | Arbeidsgiver bruker relevant beskjed fra lege som signal for oppfølging. | Arbeidsgiver | Avklaring | Avklaring | Krever juridisk, faglig og datamessig avklaring. |
| DULT-05 | Lag en miniguide innledningsvis til oppfølgingsplanen, eks: 1. Ta en prat først. En kort, uformell samtale gjør alt enklere. Snakk om hva som fungerer og hva som er vanskelig. 2. Skriv ned det viktigste Dere trenger ikke den perfekte løsningen. Bli enige om noe å prøve. 3. Del planen Del med fastlegen og Nav med et par klikk. Bryt prosessen ned til håndterbare steg med handlingsverb. Fjerner juridisk sjargong og fokuserer på hva bruker faktisk skal gjøre. | Arbeidsgiver følger en enkel stegvis prosess for samtale, plan og deling. | Arbeidsgiver | Stegvis hjelp i planflyt | Senere | Aktuell som neste klynge hvis første test gir planstart, men lav fullføring. |
| DULT-06 | Når den ansatte har en sykmelding som kommer til å passere 4 uker (eller allerede med første sykmelding) får de ekstra informasjon om at det skal lages en oppfølgingsplan sammen med sykmeldingen på Dine sykmeldte. De bør fylle ut vurdering av behovet. Kan det komme en pop-up i kvitteringen til sykmeldingen? | Arbeidsgiver blir gjort oppmerksom på planbehov tidlig nok. | Arbeidsgiver | Tidsriktig signal | Med i første test | Trigger må avklares: forventet fire uker, faktisk passert fire uker eller annet. |
| DULT-07 | Per i dag er det ingen "oppgaver" å gjøre når de mottar sykmelding, det er en passiv side med informasjon om gradering og varighet. Kan vi gi dem en gjøre-liste eller noen oppgaver? | Arbeidsgiver får en konkret handling i stedet for passiv informasjon. | Arbeidsgiver | Behovsvurdering i Dine sykmeldte | Med i første test | Handler ikke primært om å finne person, men om å gjøre flaten handlingsrettet. |
| DULT-08 | Kan vi gjøre det mulig for brukerne å markere at de har løst en oppgave, stykke opp oppgaver? Hva bør man gjøre og hva gjenstår? | Arbeidsgiver får oversikt over utførte og gjenstående oppfølgingsoppgaver. | Arbeidsgiver | Stegvis hjelp i planflyt | Senere | Krever trolig lagret status og bør ikke inn i første test. |
| DULT-09 | Gjenbruke godt innhold inne på innloggede sider | Arbeidsgiver møter relevant innhold på riktig flate. | Arbeidsgiver | Innhold og IA | Utenfor første pakke | Støtter senere innholdsarbeid. |
| DULT-10 | Det bør stå noe om arbeidsgiver sin plikt, slik at de er obs på ansvar. | Arbeidsgiver forstår plikten til oppfølging og tilrettelegging. | Arbeidsgiver | Støttende tekst og forståelse | Støtte | Bør inn som mikrotekst, men må formuleres uten å presse feil handling. |
| DULT-11 | Når arbeidsgiver logger seg inn på Dine sykmeldte når hen mottar en sykmelding, burde de komme rett inn på personen det gjelder for å se sykmeldingen. Eller i hvert fall tydeliggjøre hvor man skal trykke for å se eller gjøre noe. | Arbeidsgiver kommer raskt til riktig kontekst for handling. | Arbeidsgiver | Behovsvurdering i Dine sykmeldte | Støtte | Støtter behovsvurderingen, men er ikke hovedproblemet alene. |
| DULT-12 | Bruke kalenderavtale til evaluering av oppfølgingsplan | Arbeidsgiver og sykmeldt avtaler evaluering av planen. | Arbeidsgiver, berører sykmeldt | Evaluering og påminnelser | Senere | Kontinuitet etter plan, ikke første test. Berører sykmeldt og må vurderes i sykmeldt-sporet senere. |
| DULT-13 | Kan vi få lov å endre teksten her? Vi har fått vite?... av hvem? og i denne virksomheten kan det endres til i din virksomhet, og er virksomhet det ordet man bruker? at alle føler at det er naturlig? Det er også skrivefeil i medarbeiderne (som ikke brukes ellers som begrep). Håper vi kan få skrive om denne boksen. | Arbeidsgiver forstår tekst og begreper uten friksjon. | Arbeidsgiver | Tekst og skjermrydding | Støtte | Bør håndteres hvis første test berører samme skjerm eller boks. |
| DULT-14 | Dette er det som står om oppfølging sm. Sykmeldingen for arbeidsgiver eier vi. | Viser eksisterende innhold og eierskap. | Arbeidsgiver | Utenfor første pakke | Kontekst | Brukes som bakgrunn, ikke som selvstendig tiltak. |
| DULT-15 | Det burde være funksjonalitet for at arbeidsgiver kan oppgi at det ikke er behov for oppfølgingsplan | Arbeidsgiver kan velge riktig handling når plan ikke trengs. | Arbeidsgiver | Behovsvurdering i Dine sykmeldte | Med i første test | Må ha guardrails så valget ikke blir en snarvei bort fra plikt. |
| DULT-16 | Når Nav ber om oppfølgingsplan og arbeidsgiver vurderer at det ikke er aktuelt, bør de kunne begrunne dette med avhuking av årsak og fritekst og dele med Nav (ligger til grunn at vi har et vurderingsskjema) | Arbeidsgiver gir strukturert begrunnelse når plan ikke er aktuell. | Arbeidsgiver | Behovsvurdering i Dine sykmeldte | Avklaring | Tyngre variant av DULT-15. Fritekst skal ikke inn i første test uten juridisk avklaring, DPIA-vurdering og PII-/helsedata-guardrails. |
| DULT-17 | Når arbeidsgiver behandler sykmeldingen, kan det ligge en sjekkliste/guide hvor vi informerer om plikter med tips og råd om hvordan de bør følge opp sykmeldte. Vi bør kanskje skille på gradering/full sykmelding og tilpasse guiden slik at den kan komme med eksempler basert på yrkesgrupper. | Arbeidsgiver får plikter, tips og råd som konkret guide ved sykmeldingsbehandling. | Arbeidsgiver | Stegvis hjelp i planflyt | Senere | Overlapper DULT-05 og DULT-24. Aktuell etter første test. |
| DULT-18 | Vurdere om skal tas med | Marker behov for sortering. | Arbeidsgiver | Utenfor første pakke | Ute | Meta-lapp, ikke tiltak. |
| DULT-19 | Utkast lagret kan flyttes opp | Arbeidsgiver ser status for utkast tydeligere. | Arbeidsgiver | Stegvis hjelp i planflyt | Senere | Salience og gjenopptak av påbegynt arbeid. Aktuelt hvis første test gir planstart, men lav fullføring. |
| DULT-20 | "frist for oppfølgingsplan: x dager" på en person i "Dine sykmeldte", dersom sykmeldingsperioden tilsier det | Arbeidsgiver ser frist for oppfølgingsplan på riktig person. | Arbeidsgiver | Tidsriktig signal | Med i første test | Henger tett sammen med DULT-06. Krever presis fristregel. |
| DULT-21 | Dette kan vi scope ned til tilretteleggingsplikt | Avgrenser pliktsporet. | Arbeidsgiver | Støttende tekst og forståelse | Avklaring | Avgrensningspremiss, ikke selvstendig tiltak. |
| DULT-22 | Mulighet for å generere kalenderavtale før en person selv velger å lage en plan, foreslå om de vil ha påminnelse | Arbeidsgiver og sykmeldt får påminnelse om oppfølging før planarbeidet starter. | Arbeidsgiver, berører sykmeldt | Evaluering og påminnelser | Senere | Parkert til senere fordi første test bør måle behovsvurdering og planstart først. Berører sykmeldt og må vurderes i sykmeldt-sporet senere. |
| DULT-23 | Vi må finne ut hvor vanskelig det er å kunne ta arbeidsgiver helt inn på riktig side | Avklarer om arbeidsgiver kan lande direkte i relevant kontekst. | Arbeidsgiver | Avklaring | Avklaring | Teknisk avhengighet for DULT-11 og behovsvurderingen, ikke brukerrettet tiltak alene. |
| DULT-24 | Når arbeidsgiver kommer inn på oppfølgingsplansiden er det bedre informasjon og en stegvis forklaring av hvordan følge opp den ansatte og lage en plan | Arbeidsgiver forstår hvordan de følger opp den ansatte og lager plan. | Arbeidsgiver | Stegvis hjelp i planflyt | Senere | Aktuell når planflyten skal forbedres etter behovsvurdering. |
| DULT-25 | Fare for banner blindness + mye tekst (plassering) og at informasjon ikke leses. Bør redesigne skjermbildet "oppfølgingsplaner". Teksten bør også revideres. | Arbeidsgiver legger merke til og forstår viktig informasjon. | Arbeidsgiver | Tekst og skjermrydding | Senere | Bør brukes som guardrail hvis første test legger signal eller tekst på samme flate. |

## Avklaringer før første test

Hver tiltaksklynge har åpne spørsmål som må avklares før implementering.

| Tiltaksklynge | Avklaringer |
|---|---|
| Tidsriktig signal | Hva er riktig trigger? Forventet fire uker, faktisk passert fire uker eller noe annet? Hvem er relevant populasjon? Hvilken fristregel skal vises? Hvordan unngå støy for korte sykmeldinger? |
| Behovsvurdering | Hva er minste trygge vurdering arbeidsgiver kan gjøre? Hvilken valgstruktur bør brukes: ja/nei eller flervalg? Fritekst fra DULT-16 skal ikke inn i første test uten juridisk avklaring, DPIA-vurdering og PII-/helsedata-guardrails. Hvordan formulere «plan trengs ikke nå» uten å undergrave oppfølgingsplikten? |
| Støttende tekst | Hvilke tekster påvirker handling, og hvilke er nøytral informasjon om rettigheter og plikter? Hvor skal tekstene ligge: i signal, i behovsvurdering eller som egen flate? |
| Stegvis hjelp | Parkert nå. Neste steg hvis første test gir planstart uten fullføring. |
| Evaluering og påminnelser | Parkert, men ikke glemt. Aktuell når planer finnes og trenger kontinuitet. |
| Avklaring | Legebeskjed (DULT-04): juridisk og datamessig avklaring. Deep-link (DULT-23): teknisk avklaring. Deling med Nav/sykmeldt (DULT-16): mottaker og fritekst. |

## Målemodell for første test

Målinger bør landes på bearbeidede tiltaksklynger, ikke på alle råkortene.
Kontrollgruppen bør få dagens uendrede opplevelse.

Tiltakskolonnen viser DULT-råkortene som inngår i hver klynge. Kortene er
foreløpige dult-forslag, ikke ferdig besluttede tiltak.

| Tiltaksklynge | Tiltak i klyngen (DULT-råkort) | Ønsket atferd | Målepåvirkning | Guardrails | Åpne spørsmål |
|---|---|---|---|---|---|
| Tidsriktig signal | DULT-06: signal eller informasjon når fraværet nærmer seg fire uker. DULT-20: frist for oppfølgingsplan på riktig person. | Arbeidsgiver blir oppmerksom i tide og går videre til behovsvurdering eller plan før fristen. | Mål først nærliggende handlinger: signal vises, varsel eller personside åpnes, vurdering eller plan startes før frist. Bruk flere oppfølgingsplaner inn som effektmål, ikke eneste suksessmål. | Varsling blir for bred eller for tidlig, signalet oppleves som kontroll, eller varsler lukkes uten handling. | Hva er riktig trigger? Hvem er relevant populasjon? Hvilken fristregel skal vises? Hvordan unngå duplikat hvis plan er startet? |
| Behovsvurdering i Dine sykmeldte | DULT-01: kartlegge behov for oppfølgingsplan. DULT-07: konkret oppgave. DULT-15: svare at plan ikke trengs nå. Støtte: DULT-11 for riktig person og kontekst. | Arbeidsgiver tar stilling til behovet og velger riktig handling: lage plan, eller bekrefte at plan ikke trengs nå. | Mål først fullført behovsvurdering, fordeling mellom «lag plan» og «plan trengs ikke nå», og overgang fra signal til vurdering. Tolk oppfølgingsplaner inn sammen med «plan trengs ikke nå». | Høy andel «plan trengs ikke nå», unødvendige planer, helseopplysninger i fritekst eller vage begrunnelser. Ingen default på «plan trengs ikke nå». | Hva er minste trygge vurdering? Hvilke strukturerte årsaker er trygge? Hvordan formulere valget uten å undergrave oppfølgingsplikten? |
| Støttende tekst og forståelse | DULT-02: forklare verdien av oppfølging. DULT-10: tydeliggjøre plikt og ansvar. Eventuelt DULT-13: rydde tekst på berørt skjerm. | Arbeidsgiver forstår hvorfor oppfølging er viktig, hva oppfølgingsplikten innebærer, og hva neste steg er. | Måles som støtte, ikke egen KPI: forståelse av neste steg, forståelse av når plan trengs eller ikke trengs, og mindre frafall i vurdering eller planstart. | Teksten presser feil handling, bruker truende eller moraliserende tone, eller gjør viktig informasjon vanskeligere å få med seg. | Hvilke tekster påvirker handling? Hvilke tekster er nøytral informasjon? Hvor skal tekstene ligge, og hvordan måles de ulikt? |

Langsiktige hypoteser som sykefravær, gradert sykmelding, medvirkningsplikt og
tilretteleggingsplikt bør ikke være primær KPI i første test.

## Tiltakspakke for første test

Arbeidsnavn: **Oppgave- og veiledningslag for oppfølgingsplan**.

Dette er en avgrenset testpakke, ikke en full tiltakspakke slik Nudgelab kan
omtale pakker med 30–40 tiltak. Første test bør bestå av to hovedklynger:

1. **Tidsriktig signal**: DULT-06 og DULT-20.
2. **Behovsvurdering i Dine sykmeldte**: DULT-01, DULT-07 og DULT-15, med DULT-11 som støtte og DULT-16/DULT-23 som avklaringer.

Støttende tekst fra DULT-02, DULT-10 og eventuelt DULT-13 bør inn i de
skjermene som berøres, men ikke behandles som egne tiltaksklynger.

## Bruk sammen med Mural

Mural bør vise tiltakspakke, tiltaksklynger, tiltak i hver klynge og målinger
visuelt. Dette registeret gir bakgrunn, råkorttekst og mapping. Oppdater
registeret når et DULT-kort flyttes til en annen klynge eller får ny status.
Kolonnen «Åpne spørsmål» i Mural tilsvarer avklaringstabellen i dette
registeret og må holdes synkronisert.
