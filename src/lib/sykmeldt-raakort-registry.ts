/**
 * Register over de opprinnelige SYK-råkortene (sykmeldt-sporet) med teksten
 * verbatim fra workshop-tavla, så et tiltak kan vise hva det er bygget på rett
 * i dialogen — uten at man må slå opp en kode et annet sted.
 *
 * Kilde: `docs/dulting-tiltaksregister-sykmeldt.md` (SYK-01..19 + SYK-R1..R4).
 * Kun åpenbare transkriberings-/skrivefeil er rettet; innhold og stemme er
 * beholdt. Motstykket for arbeidsgiver er `dult-reference-registry.ts` (DULT-*).
 */
const SYK_RAAKORT: Record<string, string> = {
  "SYK-01":
    "Arbeidstaker får informasjon om sine plikter (medvirkningsplikt og aktivitetsplikt), bl.a. i forbindelse med evaluering.",
  "SYK-02":
    "Den sykmeldte blir dultet i sykmeldingen om å kontakte nærmeste leder — under skjemafeltene om arbeidsgiver og oppfølging — og det kommuniseres hva gevinsten er.",
  "SYK-03":
    "Her kan det informeres om medvirkningsplikt, dialogmøte 1 og oppfølgingsplan (kanskje ikke bruke akkurat de ordene — de er tunge).",
  "SYK-04":
    "I tillegg til medvirkningsplikten burde sykmeldte få vite hva som er leders ansvar, slik at det skapes forståelse for hva som skal skje og hvordan prosessen er videre.",
  "SYK-05":
    "Microfrontend på nav.no med informasjon om plikter fra dag 1 i sykefraværet.",
  "SYK-06":
    "Oppfordrende info av typen: god evaluering og dialog med arbeidsgiver fører ofte til raskere tilbakekomst i arbeid og øker sjansen for å beholde jobben.",
  "SYK-07":
    "Når den ansatte har en sykmelding som kommer til å passere 4 uker, får de ekstra informasjon om at det skal lages en oppfølgingsplan og at de bør vurdere behovet med leder — kanskje de også kan fylle ut egen vurdering av behovet? Kan det komme en pop-up i kvitteringen etter innsendt sykmelding?",
  "SYK-08":
    "Hvis det ikke er laget en oppfølgingsplan / vurdert plan innen 4 uker, sender vi en påminnelse på SMS om at det skal lages en plan, eventuelt vurdere behovet for en plan. Vurderingen bør kunne deles med Nav (og legen?).",
  "SYK-09":
    "Sende SMS til sykmeldt om ny info/vurdering fra Nav — oppgave i bjella som ber dem vurdere behovet for oppfølgingsplan. Blir svaret ja, går det varsel til arbeidsgiver? Mål om å informere om plikter, samt hva vi også sier til arbeidsgiveren. Vurderingen bør kunne deles med Nav.",
  "SYK-10":
    "Har ikke den sykmeldte vurdert behovet for oppfølgingsplan før uke 7, får de en ny påminnelse i kartleggingsspørsmålene og mulighet til å vurdere behovet (hvis de er i Troms og Finnmark).",
  "SYK-11":
    "På et eller annet nivå bør den sykmeldte ha (enklere enn i dag) tilgang til et verktøy/guide/informasjon om hva en oppfølgingsplan er og hva gevinsten ved å ha en er.",
  "SYK-12":
    "Et forberedelsesskjema til å lage oppfølgingsplan med lederen sin: «Hva bør du tenke på når du skal lage en plan med lederen din». En ansatt er sykmeldt fra oppgavene sine, ikke fra arbeidsplassen — kan vi si noe om dette for å underbygge muligheten for å jobbe med andre oppgaver (medvirkningsplikt)? Kanskje også eksempler på diagnosespesifikke tiltak.",
  "SYK-13":
    "En ansatt er sykmeldt fra oppgavene sine, ikke fra arbeidsplassen — kan vi si noe om dette i oppfølgingsplanen for å underbygge muligheten for å jobbe med andre oppgaver (medvirkningsplikt)? Konkrete eksempler på hva dette kan være.",
  "SYK-14":
    "Samtaleguide for å trygge den ansatte i dialog med arbeidsgiver (jf. idébanken.no — huskeliste ved sykefravær).",
  "SYK-15":
    "Evalueringsdato som default settes til f.eks. 4 uker fra dagens dato — eller til siste dag i sykmeldingen om det er nærmest.",
  "SYK-16":
    "Arbeidstaker får også påminnelse om når en plan skal evalueres. I varselet på innloggede sider følger det med en mal på hva de bør ta stilling til i evalueringen med lederen sin, så de kan forberede seg.",
  "SYK-17":
    "Evalueringsside der sykmeldt kan velge hvilke tiltak som fungerte bra og hvilke som var utfordrende.",
  "SYK-18":
    "Kan vi påpeke og oppfordre til at man fint kan lage flere planer i et lengre sykefravær — oppdatere og justere tiltakene.",
  "SYK-19":
    "Vi må forklare bedre til sykmeldt at kartleggingsspørsmål og oppfølgingsplan ikke er det samme. Spesielt viktig når kartleggingsspørsmål går nasjonalt.",
  // Runde meta-lapper (SYK-R*): kommentar/avklaring om lappene, ikke tiltak i seg selv.
  "SYK-R1":
    "Ansatt får informasjon om hva lederen skal gjøre / har fått info om (ønsket effekt: symmetri i informasjon mellom sykmeldt og leder).",
  "SYK-R2":
    "Å få til info i selve sykmeldingen er vanskeligere fordi flaten tilhører et annet team (teknisk/organisatorisk avklaring).",
  "SYK-R3":
    "Dette bør arbeidsgiver informeres om (koblingspunkt mot arbeidsgiver-sporet).",
  "SYK-R4":
    "Bør ses i lys av et mulig vurderingsskjema (avklaring, jf. AG DULT-16/24).",
};

/** Verbatim råkort-tekst for en SYK-kode, eller undefined hvis ukjent. */
export function getSykRaakort(id: string): string | undefined {
  return SYK_RAAKORT[id];
}
