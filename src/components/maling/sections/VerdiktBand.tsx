"use client";
import {
  deltaForrigePeriode,
  guardrailOk as guardrailOkFn,
  type KrTilstand,
  krSerie,
  krStatus,
  LUMI_SPORSMAL,
  lumiForSegment,
  mekanismeOk as mekanismeOkFn,
  PERIODER,
  PLAN_HENDELSER,
  pakkeForSegment,
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

function domSetning(t: KrTilstand): string {
  if (t === "paa-vei")
    return "Pakka flytter de tidlige plan-atferdene. Følg med på opplevd press.";
  if (t === "folg-med")
    return "KR-ene er på vei, men opplevd press øker i pakka — følg med.";
  return "Pakka viser ikke klar effekt mot kontroll — vurder justeringer.";
}

export function VerdiktBand({ segment, periode }: VerdiktBandProps) {
  // KR1: første plan-hendelse = «opprettet»
  const kr1raw = PLAN_HENDELSER[0].styringstall;
  const kr1Pakke = pakkeForSegment(kr1raw.metrikk, "alle");
  const kr1Kontroll = kr1raw.metrikk.kontroll;
  const kr1Delta = deltaForrigePeriode(krSerie("kr1"), periode);
  const kr1Tilstand = krStatus({
    pakke: kr1Pakke,
    kontroll: kr1Kontroll,
    forrigeDelta: kr1Delta,
  });

  // KR2
  // biome-ignore lint/style/noNonNullAssertion: vi vet at kr2 finnes
  const kr2raw = STYRINGSTALL_FASTE.find((s) => s.id === "kr2")!;
  const kr2Pakke = pakkeForSegment(kr2raw.metrikk, "alle");
  const kr2Kontroll = kr2raw.metrikk.kontroll;
  const kr2Delta = deltaForrigePeriode(krSerie("kr2"), periode);
  const kr2Tilstand = krStatus({
    pakke: kr2Pakke,
    kontroll: kr2Kontroll,
    forrigeDelta: kr2Delta,
  });

  // KR3
  // biome-ignore lint/style/noNonNullAssertion: vi vet at kr3 finnes
  const kr3raw = STYRINGSTALL_FASTE.find((s) => s.id === "kr3")!;
  const kr3Pakke = pakkeForSegment(kr3raw.metrikk, "alle");
  const kr3Kontroll = kr3raw.metrikk.kontroll;
  const kr3Delta = deltaForrigePeriode(krSerie("kr3"), periode);
  const kr3Tilstand = krStatus({
    pakke: kr3Pakke,
    kontroll: kr3Kontroll,
    forrigeDelta: kr3Delta,
  });

  // Mekanisme: Lumi — alltid alle-pool
  const mp = LUMI_SPORSMAL.map((s) => lumiForSegment(s, "alle"));
  const pakkeSnitt = mean(mp.flatMap((x) => [x.ag, x.sm]));
  const kontrollSnitt = mean(
    LUMI_SPORSMAL.flatMap((s) => [s.kontroll.ag, s.kontroll.sm]),
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
        <span className={`mal__verdikt-pille ${pilleKlasse(samlet)}`}>
          <span aria-hidden>{pilleSymbol(samlet)}</span> {pilleTekst(samlet)}
        </span>
      </div>

      <p className="mal__verdikt-dom">{domSetning(samlet)}</p>

      <div className="mal__vfliser">
        {/* KR1 */}
        <a
          href="#kr-bevis"
          className={`mal__vflis ${tilstandKlasse(kr1Tilstand)}`}
          aria-label={`KR1: plan i tide. Pakke ${kr1Pakke} %, kontroll ${kr1Kontroll} %, gap +${kr1Pakke - kr1Kontroll} prosentpoeng. ${kr1Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr1Delta)} prosentpoeng fra forrige periode. Gå til bevis.`}
        >
          <span className="mal__vflis-eyebrow">KR1</span>
          <span className="mal__vflis-label">Plan i tide</span>
          <span className="mal__vflis-tall">{kr1Pakke}%</span>
          <span
            className={`mal__vflis-pp ${kr1Pakke - kr1Kontroll >= 0 ? "" : "mal__vflis-pp--noytral"}`}
          >
            {kr1Pakke - kr1Kontroll >= 0 ? "+" : ""}
            {kr1Pakke - kr1Kontroll} prosentpoeng mer enn kontroll
          </span>
          <span className="mal__vflis-trend-chip">
            Trend: {kr1Delta >= 0 ? "▲" : "▼"} {Math.abs(kr1Delta)} fra forrige
            uke
          </span>
        </a>

        {/* KR2 */}
        <a
          href="#kr-bevis"
          className={`mal__vflis ${tilstandKlasse(kr2Tilstand)}`}
          aria-label={`KR2: tar stilling til behov. Pakke ${kr2Pakke} %, kontroll ${kr2Kontroll} %, gap +${kr2Pakke - kr2Kontroll} prosentpoeng. ${kr2Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr2Delta)} prosentpoeng fra forrige periode. Gå til bevis.`}
        >
          <span className="mal__vflis-eyebrow">KR2</span>
          <span className="mal__vflis-label">Tar stilling til behov</span>
          <span className="mal__vflis-tall">{kr2Pakke}%</span>
          <span
            className={`mal__vflis-pp ${kr2Pakke - kr2Kontroll >= 0 ? "" : "mal__vflis-pp--noytral"}`}
          >
            {kr2Pakke - kr2Kontroll >= 0 ? "+" : ""}
            {kr2Pakke - kr2Kontroll} prosentpoeng mer enn kontroll
          </span>
          <span className="mal__vflis-trend-chip">
            Trend: {kr2Delta >= 0 ? "▲" : "▼"} {Math.abs(kr2Delta)} fra forrige
            uke
          </span>
        </a>

        {/* KR3 */}
        <a
          href="#kr-bevis"
          className={`mal__vflis ${tilstandKlasse(kr3Tilstand)}`}
          aria-label={`KR3: plan uten å vente på Nav. Pakke ${kr3Pakke} %, kontroll ${kr3Kontroll} %, gap +${kr3Pakke - kr3Kontroll} prosentpoeng. ${kr3Delta >= 0 ? "Opp" : "Ned"} ${Math.abs(kr3Delta)} prosentpoeng fra forrige periode. Gå til bevis.`}
        >
          <span className="mal__vflis-eyebrow">KR3</span>
          <span className="mal__vflis-label">Plan uten å vente på Nav</span>
          <span className="mal__vflis-tall">{kr3Pakke}%</span>
          <span
            className={`mal__vflis-pp ${kr3Pakke - kr3Kontroll >= 0 ? "" : "mal__vflis-pp--noytral"}`}
          >
            {kr3Pakke - kr3Kontroll >= 0 ? "+" : ""}
            {kr3Pakke - kr3Kontroll} prosentpoeng mer enn kontroll
          </span>
          <span className="mal__vflis-trend-chip">
            Trend: {kr3Delta >= 0 ? "▲" : "▼"} {Math.abs(kr3Delta)} fra forrige
            uke
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

        {/* Lang horisont */}
        <a
          href="#lang-horisont"
          className="mal__vflis mal__vflis--noytral"
          aria-label="Lang horisont: bekrefter senere. Data ikke tilgjengelig ennå. Gå til lang horisont."
        >
          <span className="mal__vflis-label">Lang horisont</span>
          <span className="mal__vflis-sym">○</span>
          <span className="mal__vflis-sub mal__vflis-sub--faint">
            bekrefter senere
          </span>
        </a>
      </div>
    </div>
  );
}
