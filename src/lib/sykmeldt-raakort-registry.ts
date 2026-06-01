/**
 * Register over de opprinnelige SYK-råkortene (sykmeldt-sporet) med teksten
 * VERBATIM fra workshop-tavla — ordrett, ikke bearbeidet (originale skrivefeil
 * beholdt for sporbarhet). Motstykket for arbeidsgiver er `ag-raakort-registry.ts`.
 *
 * Kilde: `docs/dulting-tiltaksregister-sykmeldt.md` — «Råkort (verbatim)»-
 * kolonnen (SYK-01..19) + meta-lappene (SYK-R1..R4).
 */
const SYK_RAAKORT: Record<string, string> = {
  "SYK-01":
    "Arbeidstaker i forbindelse med evaluering får informasjon om sine plikter(medvirkningsplikt og aktivitetsplikt)",
  "SYK-02":
    "Den sykmeldte blir dultet i sykmeldingen om at den skal kontakte NL under skjemafeltene om arbeidsgiver og oppfølging og at det kommuniseres med hva gevinsten er",
  "SYK-03":
    "Her kan det informeres om medvirkningsplikt, dialogmøte 1 og oppfølgingsplan (kanskje ikke bruke de ordene bare - de er tunge)",
  "SYK-04":
    "I tillegg til medvirkningsplikten burde sykmeldte få vite hva som er leders ansvar slik at det skapes forståelse for hva som skal skje og hvordan prosessen er videre",
  "SYK-05":
    "microfrontend på nav.no med informasjon om plikter fra dag 1 i sykefravær",
  "SYK-06":
    "Oppfordrende info av type: God evaluering og dialog med Arbeidsgiver fører ofte til raskere tilbakekomst i arbeid og øker sjansen for å beholde jobben",
  "SYK-07":
    "Når den ansatte har en sykmelding som kommer til å passere 4 uker får de ekstra informasjon om at det skal lages en oppfølgingsplan og at de bør vurdere behovet med leder - kanskje de også kan fylle ut egen vurdering av behovet? Kan det komme en pop-up i kvitteringen til sykmeldingen etter at de har sendt den inn?",
  "SYK-08":
    "Hvis det ikke er laget en oppfølgingsplan/ vurdert plan innen 4 uker, så sender vi en påminnelse på SMS om at det skal lages en plan, eventuelt vurdere behovet for en plan. Vurderingen bør kunne deles med Nav (og legen?)",
  "SYK-09":
    "Sende sms til sykmeldt om ny info/vurdering fra Nav - oppgave i bjella som ber dem vurdere behovet for oppfølgingsplan - blir svaret ja går det varsel til arbeidsgiver?Mål om å informere om plikter, samt hva vi også sier til arbeidsgiveren. Vurderingen bør kunne deles med Nav.",
  "SYK-10":
    "Har ikke den sykmeldte vurdert behovet for oppfølgingsplan før uke 7, får de en ny påminnelse i kartleggingsspørsmålene og mulighet til å vurdere behovet (hvis de er i troms og finnmark)",
  "SYK-11":
    "På et eller annet nivå bør den sykmeldte ha (enklere enn i dag) tilgang til et verktøy/guide/informasjon om hva en oppfølgingsplan er og hva gevinsten ved å ha en er",
  "SYK-12":
    'Et forberedelsesskjema til å lage oppfølgingsplan med lederen sin. "Hva bør du tenke på når du skal lage en plan med lederen din".En ansatt er sykmeldt fra oppgavene sine, ikke fra arbeidsplassen - kan vi si noe om dette for å underbygge muligheten for å jobbe med andre oppgaver = medvirkningsplikt. Kanskje også eksempler på diagnosespesifikke tiltak',
  "SYK-13":
    "En ansatt er sykmeldt fra oppgavene sine, ikke fra arbeidsplassen - kan vi si noe om dette for å underbygge muligheten for å jobbe med andre oppgaver i oppfølgingsplanen = medvirkningsplikt. Konkrete eksempler på hva dette kan være",
  "SYK-14":
    "Samtaleguide for å trygge den ansatte i dialog med arbeidsgiver https://idebanken.no/folge-opp-sykefravaer/huskeliste-ved-sykefravaer",
  "SYK-15":
    "evalueringsdato som default er satt til 4 uker fra dagendsato f.eks. Eller til siste dag i sykmeldinge om det er nærmest",
  "SYK-16":
    "Arbeidstaker får også påminnelse om når en plan skal evalueres. I varselet på innloggede sider følger det med en mal på hva de bør ta stilling til i evalueringen med lederen sin, slik at de kan forbedrede seg.",
  "SYK-17":
    "Evalueringsside som sykmeldt kan velge hvilket tiltak som fungerte bra og hvilke som var utfordrende",
  "SYK-18":
    "Kan vi påpeke og oppfordre til at man fint kan lage flere planer i et lengre sykefravær. Oppdatere og justere tiltakene",
  "SYK-19":
    "Vi må forklare bedre til sykmeldt at kartleggingsspørsmål. og oppfølgingsplan er ikke samme. Spesielt viktig når kartleggingsspørsmål går nasjonalt.",
  "SYK-R1": "Ansatt får infrmasjon om hva lederen skal gjøre/har fått info om",
  "SYK-R2":
    "Å få til info i sykmeldingen er vanskeligere fordi det tilhører et annet team.",
  "SYK-R3": "Dette bør arbeidsgiver informeres om",
  "SYK-R4": "Bør ses i lys av mulig vurderingsskjema?",
  // Ikke et enkelt råkort: ST10 peker på atferdskortene fra kartleggingen generelt.
  atferdskort:
    "Atferdskortene fra kartleggingen (peker på flere kort, ikke ett enkelt råkort).",
};

/** Verbatim råkort-tekst for en SYK-kode, eller undefined hvis ukjent. */
export function getSykRaakort(id: string): string | undefined {
  return SYK_RAAKORT[id];
}
