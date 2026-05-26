# Eksempler for dulting-redaktør

## Eksempel 1: Mural-first, rydd én lapp

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
```

## Eksempel 2: Studio-first, batch-oppsummering

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
```

## Eksempel 3: Tiltakspakkeutkast

```md
## Tiltakspakke: Tidlig og enkel start på oppfølgingsplan

**Formål:** Øke andelen arbeidsgivere som vurderer og starter oppfølgingsplan
før uke 10.

### Tiltak

1. **Uke 4-varsel med tydelig hvorfor**
   - Treffer: arbeidsgiver, uke 4
   - Atferdsbarriere: lav motivasjon / uklar relevans

2. **Startmal med tre første steg**
   - Treffer: arbeidsgiver, uke 4–6
   - Atferdsbarriere: lav ability / høy friksjon

3. **Påminnelse etter kartleggingsspørsmål**
   - Treffer: sykmeldt og arbeidsgiver, uke 6
   - Atferdsbarriere: manglende prompt

### Hull

- Lite dekning for sykmeldtes medvirkningsplikt.
- Måling er uavklart.

### FORGOOD

- Openness: må forklare hvorfor Nav ber om handling.
- Respect/Options: må ikke oppleves som press til aktivitet som ikke passer
  situasjonen.

### Før review

- Sjekk PII/saksnær tekst.
- Avklar juridisk formulering av plikt.
- Velg målepunkt.
```

