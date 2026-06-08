"use client";
import { Tag } from "@navikt/ds-react";
import {
  deltaForrigePeriode,
  erKausalKontekst,
  guardrailOk as guardrailOkFn,
  type KrTilstand,
  krSerieForSegment,
  krStatus,
  LANG_HORISONT,
  LUMI_SPORSMAL,
  lumiForSegment,
  mekanismeOk as mekanismeOkFn,
  PERIODER,
  PLAN_HENDELSER,
  pakkeForSegment,
  SEGMENT_LABEL,
  type Segment,
  STYRINGSTALL_FASTE,
  samletVerdikt,
  VARSEL_ETIKK,
} from "../maling-data";

/** Lokal hjelpefunksjon — ikke eksportert. */
function mean(vals: number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

type VerdiktBandProps = {
  segment: Segment;
  periode: number;
};

function tilstandKlasse(t: KrTilstand): string {
  if (t === "paa-vei") return "mal__vflis--paa-vei";
  if (t === "folg-med") return "mal__vflis--folg-med";
  return "mal__vflis--ikke-paa-vei";
}

function pilleKlasse(t: KrTilstand): string {
  if (t === "paa-vei") return "mal__verdikt-pille--paa-vei";
  if (t === "folg-med") return "mal__verdikt-pille--folg-med";
  return "mal__verdikt-pille--ikke-paa-vei";
}

function pilleSymbol(t: KrTilstand): string {
  if (t === "paa-vei") return "✓";
  if (t === "folg-med") return "!";
  return "✕";
}

function pilleTekst(t: KrTilstand): string {
  if (t === "paa-vei") return "PÅ RETT VEI";
  if (t === "folg-med") return "FØLG MED";
  return "IKKE PÅ VEI";
}

function domSetning(
  t: KrTilstand,
  opts: { guardrailOk: boolean; mekanismeOk: boolean; kausal: boolean },
): string {
  if (!opts.kausal) {
    // Responsgruppe — mønster, ikke bevist effekt
    if (t === "paa-vei")
      return "Mønster for gruppen: KR-ene ligger over kontroll, men gruppen er selvvalgt — ikke en bevist effekt.";
    if (t === "ikke-paa-vei")
      return "Mønster for gruppen: KR-ene skiller seg ikke tydelig fra kontroll. Gruppen er selvvalgt — ikke en bevist effekt.";
    return "Mønster for gruppen: KR-ene viser en positiv retning, men gruppen er selvvalgt — følg med.";
  }
  if (t === "paa-vei")
    return "Pakka flytter de tidlige plan-atferdene. Følg med på opplevd press.";
  if (t === "ikke-paa-vei")
    return "Pakka viser ikke klar effekt mot kontroll — vurder justeringer.";
  // folg-med: distinguish cause
  if (!opts.guardrailOk)
    return "KR-ene er på vei, men opplevd press øker i pakka — følg med.";
  if (!opts.mekanismeOk)
    return "KR-ene er på vei, men dialogen bedres ikke nok — følg med.";
  return "KR-ene er på vei — fortsett å følge med på trenden.";
}

export function VerdiktBand({ segment, periode }: VerdiktBandProps) {
  const kausal = erKausalKontekst(segment);

  // KR1: første plan-hendelse = «opprettet»
  const kr1raw = PLAN_HENDELSER[0].styringstall;
  const kr1Pakke = pakkeForSegment(kr1raw.metrikk, segment);
  const kr1Kontroll = kr1raw.metrikk.kontroll;
  const kr1Delta = deltaForrigePeriode(
    krSerieForSegment("kr1", segment),
    periode,
  );
  const kr1Tilstand = krStatus({
    pakke: kr1Pakke,
    kontroll: kr1Kontroll,
    forrigeDelta: kr1Delta,
  });

  // KR2
  // biome-ignore lint/style/noNonNullAssertion: vi vet at kr2 finnes
  const kr2raw = STYRINGSTALL_FASTE.find((s) => s.id === "kr2")!;
  const kr2Pakke = pakkeForSegment(kr2raw.metrikk, segment);
  const kr2Kontroll = kr2raw.metrikk.kontroll;
  const kr2Delta = deltaForrigePeriode(
    krSerieForSegment("kr2", segment),
    periode,
  );
  const kr2Tilstand = krStatus({
    pakke: kr2Pakke,
    kontroll: kr2Kontroll,
    forrigeDelta: kr2Delta,
  });

  // KR3
  // biome-ignore lint/style/noNonNullAssertion: vi vet at kr3 finnes
  const kr3raw = STYRINGSTALL_FASTE.find((s) => s.id === "kr3")!;
  const kr3Pakke = pakkeForSegment(kr3raw.metrikk, segment);
  const kr3Kontroll = kr3raw.metrikk.kontroll;
  const kr3Delta = deltaForrigePeriode(
    krSerieForSegment("kr3", segment),
    periode,
  );
  const kr3Tilstand = krStatus({
    pakke: kr3Pakke,
    kontroll: kr3Kontroll,
    forrigeDelta: kr3Delta,
  });

  // Mekanisme: Lumi — segment-styrt pakke-snitt, kontroll er alltid hele kontrollen
  const sammenlignbare = LUMI_SPORSMAL.filter((s) => !s.kunPakke);
  const mp = sammenlignbare.map((s) => lumiForSegment(s, segment));
  const pakkeSnitt = mean(mp.flatMap((x) => [x.ag, x.sm]));
  const kontrollSnitt = mean(
    // biome-ignore lint/style/noNonNullAssertion: sammenlignbare har alltid kontroll
    sammenlignbare.flatMap((s) => [s.kontroll!.ag, s.kontroll!.sm]),
  );
  const mekanismeOk = mekanismeOkFn(pakkeSnitt, kontrollSnitt);

  // Guardrail: opplevd press skal ikke øke (lavere = bedre)
  const guardrailOk = guardrailOkFn(
    VARSEL_ETIKK.pressFelt.pakke,
    VARSEL_ETIKK.pressFelt.kontroll,
  );

  const samlet = samletVerdikt([kr1Tilstand, kr2Tilstand, kr3Tilstand], {
    mekanismeOk,
    guardrailOk,
  });

  // Periodevisning for eyebrow
  const periodeNavn = PERIODER[periode];

  return (
    <div
      className="mal__verdikt"
      // re-render trigger — segment/periode drives via props
      data-segment={segment}
      data-periode={periode}
    >
      <div className="mal__verdikt-top">
        <span className="mal__verdikt-eyebrow">
          Tiltakspakke 1 · pilot T&amp;F · {periodeNavn}
        </span>
        {/* <output> = implicit role="status" + aria-live="polite"; announces verdict on period/segment change */}
        <output aria-atomic="true" style={{ display: "contents" }}>
          <span className={`mal__verdikt-pille ${pilleKlasse(samlet)}`}>
            <span aria-hidden>{pilleSymbol(samlet)}</span> {pilleTekst(samlet)}
          </span>
        </output>
      </div>

      {/* dom-setning inside a second live region so it is announced alongside the pille */}
      <output aria-atomic="true">
        <p className="mal__verdikt-dom">
          {domSetning(samlet, { guardrailOk, mekanismeOk, kausal })}
        </p>
      </output>

      {!kausal && (
        <p className="mal__verdikt-respons-advarsel">
          <Tag variant="warning" size="small">
            Responsgruppe
          </Tag>
          <span>
            {SEGMENT_LABEL[segment]} valgte selv — forskjellen mot kontroll er
            et mønster, ikke en bevist effekt.
          </span>
        </p>
      )}

      <div className="mal__vfliser">
        {/* KR1 */}
        <a
          href="#kr-bevis"
          className={`mal__vflis ${tilstandKlasse(kr1Tilstand)}`}
          aria-label={
            kausal
              ? `KR1: plan i tide. Pakke ${kr1Pakke} %, kontroll ${kr1Kontroll} %, gap +${kr1Pakke - kr1Kontroll} prosentpoeng vs. kontroll. ${kr1Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr1Delta)} prosentpoeng vs. forrige uke. Gå til bevis.`
              : `KR1: plan i tide. Pakke ${kr1Pakke} %, kontroll ${kr1Kontroll} %, ${kr1Pakke - kr1Kontroll} prosentpoeng over kontroll (mønster for selvvalgt gruppe, ikke effekt). ${kr1Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr1Delta)} prosentpoeng vs. forrige uke. Gå til bevis.`
          }
        >
          <span className="mal__vflis-eyebrow">KR1</span>
          <span className="mal__vflis-label">Plan i tide</span>
          <span className="mal__vflis-tall">{kr1Pakke}%</span>
          <span
            className={`mal__vflis-pp ${kr1Pakke - kr1Kontroll >= 0 ? "" : "mal__vflis-pp--noytral"}`}
          >
            <span className="mal__vflis-pp-lbl">vs. kontroll</span>{" "}
            {kr1Pakke - kr1Kontroll >= 0 ? "+" : ""}
            {kr1Pakke - kr1Kontroll} pp
          </span>
          <span className="mal__vflis-trend-chip">
            vs. forrige uke {kr1Delta >= 0 ? "▲" : "▼"} {Math.abs(kr1Delta)}
          </span>
        </a>

        {/* KR2 */}
        <a
          href="#kr-bevis"
          className={`mal__vflis ${tilstandKlasse(kr2Tilstand)}`}
          aria-label={
            kausal
              ? `KR2: tar stilling til behov. Pakke ${kr2Pakke} %, kontroll ${kr2Kontroll} %, gap +${kr2Pakke - kr2Kontroll} prosentpoeng vs. kontroll. ${kr2Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr2Delta)} prosentpoeng vs. forrige uke. Gå til bevis.`
              : `KR2: tar stilling til behov. Pakke ${kr2Pakke} %, kontroll ${kr2Kontroll} %, ${kr2Pakke - kr2Kontroll} prosentpoeng over kontroll (mønster for selvvalgt gruppe, ikke effekt). ${kr2Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr2Delta)} prosentpoeng vs. forrige uke. Gå til bevis.`
          }
        >
          <span className="mal__vflis-eyebrow">KR2</span>
          <span className="mal__vflis-label">Tar stilling til behov</span>
          <span className="mal__vflis-tall">{kr2Pakke}%</span>
          <span
            className={`mal__vflis-pp ${kr2Pakke - kr2Kontroll >= 0 ? "" : "mal__vflis-pp--noytral"}`}
          >
            <span className="mal__vflis-pp-lbl">vs. kontroll</span>{" "}
            {kr2Pakke - kr2Kontroll >= 0 ? "+" : ""}
            {kr2Pakke - kr2Kontroll} pp
          </span>
          <span className="mal__vflis-trend-chip">
            vs. forrige uke {kr2Delta >= 0 ? "▲" : "▼"} {Math.abs(kr2Delta)}
          </span>
        </a>

        {/* KR3 */}
        <a
          href="#kr-bevis"
          className={`mal__vflis ${tilstandKlasse(kr3Tilstand)}`}
          aria-label={
            kausal
              ? `KR3: plan uten å vente på Nav. Pakke ${kr3Pakke} %, kontroll ${kr3Kontroll} %, gap +${kr3Pakke - kr3Kontroll} prosentpoeng vs. kontroll. ${kr3Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr3Delta)} prosentpoeng vs. forrige uke. Gå til bevis.`
              : `KR3: plan uten å vente på Nav. Pakke ${kr3Pakke} %, kontroll ${kr3Kontroll} %, ${kr3Pakke - kr3Kontroll} prosentpoeng over kontroll (mønster for selvvalgt gruppe, ikke effekt). ${kr3Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr3Delta)} prosentpoeng vs. forrige uke. Gå til bevis.`
          }
        >
          <span className="mal__vflis-eyebrow">KR3</span>
          <span className="mal__vflis-label">Plan uten å vente på Nav</span>
          <span className="mal__vflis-tall">{kr3Pakke}%</span>
          <span
            className={`mal__vflis-pp ${kr3Pakke - kr3Kontroll >= 0 ? "" : "mal__vflis-pp--noytral"}`}
          >
            <span className="mal__vflis-pp-lbl">vs. kontroll</span>{" "}
            {kr3Pakke - kr3Kontroll >= 0 ? "+" : ""}
            {kr3Pakke - kr3Kontroll} pp
          </span>
          <span className="mal__vflis-trend-chip">
            vs. forrige uke {kr3Delta >= 0 ? "▲" : "▼"} {Math.abs(kr3Delta)}
          </span>
        </a>

        {/* Dialog (Lumi) */}
        <a
          href="#mekanisme"
          className="mal__vflis mal__vflis--folg-med"
          aria-label={`Dialog via Lumi. Pakke-snitt ${pakkeSnitt.toFixed(1)} vs kontroll-snitt ${kontrollSnitt.toFixed(1)} på 1–5-skala. Opplevd press: pakke ${VARSEL_ETIKK.pressFelt.pakke} % vs kontroll ${VARSEL_ETIKK.pressFelt.kontroll} %. Gå til mekanisme.`}
        >
          <span className="mal__vflis-label">Dialog (Lumi)</span>
          <span className="mal__vflis-sym">{mekanismeOk ? "▲" : "▼"}</span>
          <span className="mal__vflis-sub mal__vflis-sub--warn">
            press: følg med
          </span>
        </a>

        {/* Lang horisont — foreløpig, ikke et KR; underordnet de tre KR-flisene */}
        <a
          href="#lang-horisont"
          className="mal__vflis mal__vflis--noytral mal__vflis--bekrefter"
          aria-label={`Lang horisont: bekrefter senere. Gjelder alle i tiltakspakka — endres ikke av responsfilteret. Foreløpige signaler: gradert andel pakke ${LANG_HORISONT.gradertAndel.pakke} % mot kontroll ${LANG_HORISONT.gradertAndel.kontroll} % (▲), fraværslengde pakke ${LANG_HORISONT.fraværslengde.pakke} dager mot kontroll ${LANG_HORISONT.fraværslengde.kontroll} dager (▼ kortere). Gå til lang horisont.`}
        >
          <span className="mal__vflis-label">Lang horisont</span>
          <span className="mal__vflis-sym mal__vflis-sym--muted">○</span>
          <span className="mal__vflis-sub mal__vflis-sub--faint">
            bekrefter senere
          </span>
          <span className="mal__vflis-lh-hint">
            ▲ gradert · ▼ fravær{" "}
            <span className="mal__vflis-lh-forlop">(foreløpig)</span>
          </span>
          <span className="mal__vflis-sub mal__vflis-sub--faint">
            Alle i pakka · uendret av filteret
          </span>
        </a>
      </div>
    </div>
  );
}
