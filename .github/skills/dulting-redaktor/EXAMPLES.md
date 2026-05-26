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

## Eksempel 3: Klyngeforslag, ikke tiltakspakke

```md
## Klynge: Tidlig forståelse og lav terskel for oppfølgingsplan

**Felles tema:** Flere lapper handler om at arbeidsgiver får signal tidlig,
men ikke forstår hvorfor de skal handle eller hvordan de kommer i gang.

### Kilder

1. `item-12` — arbeidsgiver forstår ikke hvorfor uke 4-varselet kommer
2. `item-18` — behov for tydeligere neste steg etter varsel
3. `item-21` — usikkerhet om hva oppfølgingsplanen skal inneholde

### Mulig tiltakskandidat

Forklar uke 4-varselet som tidlig hjelp og gi arbeidsgiver et konkret første
steg for å starte oppfølgingsplan.

**Status:** tiltakskandidat, må valideres av teamet  
**Konfidens:** middels  
**Treffer trolig:** arbeidsgiver, uke 4  
**Atferdsbarriere:** lav motivation og lav ability

### Overlapp og konflikt

- `item-12` og `item-18` overlapper og bør kanskje slås sammen.
- `item-21` kan være egen undertematikk om innhold i planen.

### Hull

- Ingen tydelig lapp om sykmeldtes medvirkning i denne klyngen.
- Målepunkt er ikke beskrevet.

### Før dette kan bli tiltakspakke

- Teamet må velge mål for pakken.
- Juridisk formulering av plikt må avklares.
- PII/saksnær tekst må sjekkes manuelt.
```
