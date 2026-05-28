# Eksempler for dulting-redaktør

## Eksempel 1: Interaktiv fasilitering, første pass

**Input**

```text
Vi har 40 lapper i Mural som overlapper. Hjelp meg å rydde dem sammen med meg.
```

**Output**

```md
## Spørsmål 1: Skal disse to lappene stå i samme klynge?

**Kilder:** W12, W18

**Vurdering nå:** tematisk overlapp, ikke rene duplikater

- `W12`: Arbeidsgiver skjønner ikke hvorfor varsel kommer allerede i uke 4.
- `W18`: Arbeidsgiver forstår ikke hva de skal gjøre når varselet kommer.

**Anbefalt svar:** Ja, start med én klynge.

**Hvorfor:** Begge lappene peker mot samme tema, men sier ikke helt det samme.
Den ene handler mest om hvorfor varselet kommer, den andre om hva
arbeidsgiver skal gjøre. Det er nok til å teste én felles klynge nå. Aktørspor
og brukerreisesteg kan legges på senere hvis klyngen holder.

Svar med ett av disse valgene:
- `ja, samme klynge`
- `nei, skill dem`
- `usikker, trenger én mellomkategori`

Hvis du vil, kan jeg også føre en kort sanitert beslutningslogg underveis:

- Begrep: `uke 4-varsel` brukes som felles navn
- Klyngebeslutning: `W12` og `W18` testes i samme klynge
- Åpent spørsmål: gjelder dette forståelse av timing, innhold eller begge deler?
- Målepremiss: vi trenger senere et tegn på at arbeidsgiver faktisk starter tidligere

Hvis du svarer `ja, samme klynge`, kan neste steg i første slice være:

- **Studio-klynge:** `Forståelse av uke 4-varsel`
- **Sanitert sammendrag:** `Arbeidsgiver forstår verken hvorfor varselet kommer tidlig eller hva de skal gjøre når det kommer.`
- **Status:** `draft`
- **Kilder i Mural:** `W12, W18`

FORGOOD/EAST/Fogg og validerte måletegn hører ikke til denne klyngen. De kommer
først hvis teamet senere gjør klyngen om til en tiltakskandidat.
```

## Eksempel 2: Mural-first, rydd én lapp

**Input**

```text
AG får varsel uke 4, men skjønner ikke hvorfor NAV maser allerede.
```

**Output**

```md
### Varsel må forklare hvorfor uke 4 betyr noe

**Type:** Barriere / tiltakside  
**Aktørspor:** Arbeidsgiver  
**Brukerreisesteg:** Uke 4 / behov for oppfølgingsplan  
**Ønsket atferd:** Arbeidsgiver vurderer og starter oppfølgingsplan uten å vente
på veileder.

**Hypotese:** Hvis varselet forklarer hvorfor tidlig vurdering hjelper både
arbeidsgiver og sykmeldt, øker sjansen for at arbeidsgiver starter planen i uke
4.

**EAST/Fogg:** Gjør handlingen mer timely og øker motivation. Ability må sikres
med tydelig neste steg.

**FORGOOD-flagg:** Openness må ivaretas: varselet må være tydelig på hvorfor
Nav ber om handling.

**Neste spørsmål:** Hvilken konkret handling skal arbeidsgiver ta rett etter
varselet?

**PII:** Ingen synlig risiko.

**Merk:** Dette er en arbeidsvurdering av én lapp, ikke en lagret Studio-klynge.
```

## Eksempel 3: Studio-first, batch-oppsummering

**Input**

```text
10 inbox-items fra samme brukerreisesteg: uke 4 / arbeidsgiver.
```

**Output**

```md
## Foreslått gruppering

### 1. Forstå plikten tidligere
- Kilder: item-12, item-18, item-21
- Foreslått tiltak: Forklar uke 4-varsel som tidlig hjelp, ikke kontroll.
- Åpent spørsmål: Hvilken formulering er juridisk presis nok?

### 2. Senke terskel for å starte planen
- Kilder: item-14, item-17
- Foreslått tiltak: Vis kort startmal med tre første felter.
- Åpent spørsmål: Hvilke felter kan forhåndsutfylles uten å bli feil?

### 3. Parkeres
- Kilder: item-19
- Begrunnelse: Handler om dialogmøte, ikke oppfølgingsplan.

## Dekning

- Aktørspor: dekker arbeidsgiver, ikke sykmeldt.
- Brukerreise: dekker uke 4, ikke uke 6/8.
- PII-stoppunkt: ingen synlig PII, men én lapp må språkvaskes for saksnær tekst.
- Målinger: rå målelapper er fanget opp, men behandles senere hvis klyngene
  blir stående.
- Neste steg i Studio: lag eventuelt klynger med navn, sanitert sammendrag,
  status og kilder. Ikke legg EAST/Fogg/FORGOOD på selve klyngen.
```

## Eksempel 4: Klyngeforslag, ikke tiltakspakke

```md
## Klynge: Tidlig forståelse og lav terskel for oppfølgingsplan

**Felles tema:** Flere lapper handler om at arbeidsgiver får signal tidlig,
men ikke forstår hvorfor de skal handle eller hvordan de kommer i gang.

### Kilder

1. `item-12` — arbeidsgiver forstår ikke hvorfor uke 4-varselet kommer
2. `item-18` — behov for tydeligere neste steg etter varsel
3. `item-21` — usikkerhet om hva oppfølgingsplanen skal inneholde

### Studio-klynge i første slice

- **Navn:** Tidlig forståelse og lav terskel for oppfølgingsplan
- **Sanitert sammendrag:** Arbeidsgiver trenger både forklaring på hvorfor de får
  varselet tidlig og et tydelig første steg for å komme i gang.
- **Status:** draft
- **Kilder:** item-12, item-18, item-21

**Konfidens:** middels  
**Treffer trolig:** arbeidsgiver, uke 4

### Overlapp og konflikt

- `item-12` og `item-18` overlapper og bør kanskje slås sammen.
- `item-21` kan være egen undertematikk om innhold i planen.

### Hull

- Ingen tydelig lapp om sykmeldtes medvirkning i denne klyngen.
- Målepunkt tas senere. Rå målelapper er ikke nok som fasit ennå.

### Senere bearbeiding, utenfor første slice

- Teamet kan senere skrive én eller flere tiltakskandidater ut fra klyngen.
- FORGOOD/EAST/Fogg og validerte måletegn hører hjemme på tiltakskandidaten,
  ikke på klyngen.

### Før dette kan bli tiltakspakke

- Teamet må velge mål for pakken.
- Juridisk formulering av plikt må avklares.
- PII/saksnær tekst må sjekkes manuelt.
```
