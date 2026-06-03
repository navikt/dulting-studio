"use client";

// Dummy måle-dashboard for tiltakspakke 1 — gjør målerammeverket
// (docs/maling-rammeverk.md) konkret: hvordan skjermen KUNNE sett ut, med
// A/B/C-segmentering. ALLE TALL ER SYNTETISKE. Ingen live data, ingen personer.
// Bygd inn i appen (Aksel-palett), ikke en egen tjeneste.
//
// Siden leser top-ned som virkningskjeden: kart → nære spaker (hardt) →
// mekanisme (opplevd/Lumi) → ringvirkning (bekreftende) → datakilder/vakt.
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import "./maling.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

// Tre KATEGORISK ulike farger (ikke opacity på én blå) — slate / lilla / blå.
type Seg = "A" | "C" | "B";
const SEGS: Seg[] = ["A", "C", "B"];
const SEG_SHORT: Record<Seg, string> = {
  A: "Kontroll",
  C: "Ikke opt-in",
  B: "Opt-in",
};
const SEG_FULL: Record<Seg, string> = {
  A: "Ingen pakke (kontroll)",
  C: "Pakke, ikke opt-in",
  B: "Pakke + opt-in",
};

// --- virkningskjede (theory of change): tre høyder ---
const CHAIN_LEVERS = [
  "Forklare hvorfor (forståelse)",
  "Tidlig varsel (opt-in)",
  "Behovsvurdering ≤ uke 4",
  "Plan laget & delt i tide",
  "Uten å vente på veileder",
];
type ChainKind = "now" | "far" | "later";
const CHAIN_KR: { label: string; status: string; kind: ChainKind }[] = [
  {
    label: "Flere / tidligere oppfølgingsplaner",
    status: "Sikter på nå",
    kind: "now",
  },
  { label: "↑ Gradert sykmelding", status: "Lang horisont", kind: "far" },
  { label: "Kortere sykefravær", status: "Lang horisont", kind: "far" },
  { label: "Flere dialogmøte 1", status: "Senere · kun Lumi", kind: "later" },
];

type Kpi = {
  label: string;
  sub: string;
  group: "funnel" | "parallel";
  vals: Record<Seg, number>;
};
const KPIS: Kpi[] = [
  {
    label: "Plan laget ≤ uke 4",
    sub: "KR1",
    group: "funnel",
    vals: { A: 34, C: 41, B: 68 },
  },
  {
    label: "Delt med legen ≤ uke 4",
    sub: "KR1 · fullført",
    group: "funnel",
    vals: { A: 18, C: 22, B: 41 },
  },
  {
    label: "Delt med Nav ≤ uke 8",
    sub: "KR1 · fullført",
    group: "funnel",
    vals: { A: 15, C: 19, B: 33 },
  },
  {
    label: "Tar stilling til behov ≤ uke 4",
    sub: "KR2",
    group: "parallel",
    vals: { A: 29, C: 35, B: 60 },
  },
  {
    label: "Plan uten å vente på veileder",
    sub: "KR3",
    group: "parallel",
    vals: { A: 12, C: 16, B: 38 },
  },
];

// Andel av pakke-kohorten (T&F) som huker av påminnelsen. Definerer B vs. C.
const OPT_IN_RATE = 58;

// Pakke samlet (B+C), vektet på opt-in-rate — den ENESTE rene sammenligningen
// mot kontroll (region avgjør pakke, ikke selvvalg). Vist for «plan laget».
const POOLED_PLAN = Math.round(
  (OPT_IN_RATE / 100) * KPIS[0].vals.B +
    (1 - OPT_IN_RATE / 100) * KPIS[0].vals.C,
);
const POOLED_PLAN_DELTA = POOLED_PLAN - KPIS[0].vals.A;

const FUNNEL: { label: string; sub: string; vals: Record<Seg, number> }[] = [
  {
    label: "Sykmelding mottatt",
    sub: "kohort-inngang",
    vals: { A: 100, C: 100, B: 100 },
  },
  {
    label: "Lager plan",
    sub: "påminnelse utløst ~uke 4",
    vals: { A: 34, C: 41, B: 68 },
  },
  { label: "Sender til legen", sub: "≤ uke 4", vals: { A: 18, C: 22, B: 41 } },
  { label: "Sender til Nav", sub: "≤ uke 8", vals: { A: 15, C: 19, B: 33 } },
  {
    label: "Fortsatt aktiv",
    sub: "evaluering valgt",
    vals: { A: 11, C: 14, B: 26 },
  },
];

// Kumulativ andel med plan, uke 1–8, per segment (uke-8 = ≤uke-4-KPI-en).
const TREND_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];
const TREND: Record<Seg, number[]> = {
  A: [1, 3, 8, 18, 24, 29, 32, 34],
  C: [1, 4, 11, 24, 31, 37, 40, 41],
  B: [2, 9, 26, 49, 58, 63, 66, 68],
};

// Mekanisme/opplevelse (Lumi) — to surveyer (AG + sykmeldt), kjørt på ALLE
// segmenter inkl. kontroll, så forskjellen er synlig. Segment-styrt.
type MechVals = Record<Seg, { ag: number; sm: number }>;
const MECHANISM: { q: string; vals: MechVals }[] = [
  {
    q: "Forstår hvorfor oppfølging er viktig",
    vals: {
      A: { ag: 48, sm: 42 },
      C: { ag: 61, sm: 55 },
      B: { ag: 79, sm: 72 },
    },
  },
  {
    q: "Kom tidlig i kontakt",
    vals: {
      A: { ag: 44, sm: 39 },
      C: { ag: 52, sm: 47 },
      B: { ag: 71, sm: 64 },
    },
  },
  {
    q: "Opplevde det som støtte, ikke press",
    vals: {
      A: { ag: 55, sm: 46 },
      C: { ag: 60, sm: 52 },
      B: { ag: 68, sm: 59 },
    },
  },
  {
    q: "Fant tilrettelegging som funka",
    vals: {
      A: { ag: 41, sm: 38 },
      C: { ag: 47, sm: 43 },
      B: { ag: 55, sm: 51 },
    },
  },
];

// Ringvirkning (lang horisont, bekreftende) — kun gradert + fravær.
// Pakke samlet (B+C) vs. kontroll = den rene sammenligningen.
const RIPPLE: {
  label: string;
  sub: string;
  pakke: string;
  kontroll: string;
  delta: string;
}[] = [
  {
    label: "Gradert sykmelding",
    sub: "register-fotavtrykk av at tilrettelegging skjedde",
    pakke: "38 %",
    kontroll: "31 %",
    delta: "+7 pp ↑",
  },
  {
    label: "Median fraværslengde",
    sub: "det endelige O1-utfallet",
    pakke: "41 dager",
    kontroll: "46 dager",
    delta: "−5 dager ↓",
  },
];

// Opplevd press/varseltrøtthet (Lumi) — vi kan ikke flytte objektiv
// varseltrøtthet (1 varsel = dråpe i havet); vi måler det opplevde.
const PRESS_FELT = 9;

// --- trend-geometri ---
const TW = 360;
const TL = 28;
const TR = 330;
const TT = 12;
const TB = 104;
const TMAX = 72;
const tx = (i: number) => TL + (i * (TR - TL)) / (TREND_WEEKS.length - 1);
const ty = (v: number) => TB - (v / TMAX) * (TB - TT);
const trendStr = (arr: number[]) =>
  arr.map((v, i) => `${tx(i).toFixed(1)},${ty(v).toFixed(1)}`).join(" ");

export function MalingView() {
  const [seg, setSeg] = useState<Seg>("B");

  return (
    <div className={`mal ${schibsted.variable}`}>
      <Link className="mal__back" href="/">
        <ArrowLeftIcon aria-hidden fontSize="0.9rem" /> Forsiden
      </Link>

      <div className="mal__dummy" role="note">
        <b>Dummy-dashboard.</b> Alle tall er syntetiske — en skisse av hvordan
        målingene <i>kunne</i> sett ut. Ingen live data, ingen reelle personer.
      </div>

      <header>
        <span className="mal__eyebrow">
          Måling · tiltakspakke 1 · pilot Troms og Finnmark
        </span>
        <h1 className="mal__title">Virker dulting? — segmentert</h1>
        <p className="mal__lede">
          Tidlige plan-atferder som lader opp til lavere sykefravær, brutt ned
          på om du har pakka og om du har slått på påminnelsen.
        </p>
        <p className="mal__frame">
          <b>Hva vi sikter på nå:</b> i denne runden lover vi ikke lavere
          sykefravær. Vi flytter de tidlige plan-atferdene som <i>lader opp</i>{" "}
          til det — og måler dem rent, segmentert, med guardrails.
        </p>
      </header>

      {/* aria-live: annonser segment-bytte til skjermleser */}
      <div aria-live="polite" className="sr-only">
        Viser segment {seg} — {SEG_FULL[seg]}
      </div>

      {/* 1 — VIRKNINGSKJEDE (kart) */}
      <section className="mal__sec" aria-labelledby="mal-chain-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">1</span>
          <div>
            <h2 className="mal__h2" id="mal-chain-h">
              Slik henger det sammen
            </h2>
            <p className="mal__sec-sub">
              Vi måler og styrer venstre side hardt nå. Høyre side lader vi opp
              til — tregt og bekreftende. Statusfargene er ikke segment-farger
              (grønn = sikter på nå).
            </p>
          </div>
        </div>
        <div className="mal__chain">
          <div className="mal__chain-col">
            <span className="mal__chain-head">Spaker vi rører nå</span>
            {CHAIN_LEVERS.map((l) => (
              <span className="mal__chain-lever" key={l}>
                {l}
              </span>
            ))}
          </div>
          <span className="mal__chain-arrow" aria-hidden>
            →
          </span>
          <div className="mal__chain-col">
            <span className="mal__chain-head">Mellomliggende mål</span>
            {CHAIN_KR.map((kr) => (
              <div
                className={`mal__chain-kr mal__chain-kr--${kr.kind}`}
                key={kr.label}
              >
                {kr.label}
                <span className="mal__chain-status">{kr.status}</span>
              </div>
            ))}
          </div>
          <span className="mal__chain-arrow" aria-hidden>
            →
          </span>
          <div className="mal__chain-col mal__chain-col--goal">
            <span className="mal__chain-head">Overordnet mål</span>
            <div className="mal__chain-goal">
              <b>O1</b>
              <span className="mal__chain-goal-t">Redusert sykefravær</span>
              <span className="mal__chain-goal-s">
                ved bruk av dulting (AID / IA)
              </span>
            </div>
          </div>
        </div>
        <p className="mal__chain-note">
          «Forklare hvorfor» måles i mekanisme-laget (§5), ikke som et eget
          O1-mål.
        </p>
      </section>

      {/* 2 — SEGMENT + KPI */}
      <section className="mal__sec" aria-labelledby="mal-seg-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">2</span>
          <div>
            <h2 className="mal__h2" id="mal-seg-h">
              Velg hvem tallene gjelder
            </h2>
            <p className="mal__sec-sub">
              Styrer KPI-ene, trenden og mekanismen. Funnelen viser alle tre;
              ringvirkninger vises pakke vs. kontroll.
            </p>
          </div>
        </div>
        <div className="mal__toggle">
          {SEGS.map((s) => (
            <button
              type="button"
              key={s}
              className={`mal__toggle-btn mal__toggle-btn--${s.toLowerCase()}${
                seg === s ? " mal__toggle-btn--on" : ""
              }`}
              aria-pressed={seg === s}
              onClick={() => setSeg(s)}
            >
              <span
                className={`mal__sw mal__sw--${s.toLowerCase()}`}
                aria-hidden
              />
              <span className="mal__toggle-txt">
                <b>{s}</b> {SEG_FULL[s]}
              </span>
              {seg === s && (
                <span className="mal__toggle-check" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mal__optin">
          <b className="mal__optin-num">{OPT_IN_RATE}%</b> av pakke-kohorten
          huker av påminnelsen <span className="mal__optin-tag">opt-in</span> —
          det er dette valget som skiller <b>B</b> fra <b>C</b>, og selve
          dulte-flaten.
        </p>
        <div className="mal__pooled">
          <span className="mal__pooled-tag">Den rene sammenligningen</span>
          <span className="mal__pooled-body">
            <b className="mal__pooled-num">+{POOLED_PLAN_DELTA} pp</b> plan
            laget for <b>pakke samlet (B+C)</b> mot kontroll — region avgjør,
            ikke selvvalg (før/etter, diff-in-diff; forutsatt planer telles på
            tvers av Nav + LPS). Dette er tallet å stole på for «virket pakka».
          </span>
        </div>

        <div className="mal__kpis">
          {KPIS.map((k) => {
            const v = k.vals[seg];
            const delta = v - k.vals.A;
            const max = Math.max(k.vals.A, k.vals.C, k.vals.B);
            return (
              <div className="mal__kpi" key={k.label}>
                <span className="mal__kpi-sub">{k.sub}</span>
                <span className="mal__kpi-label">{k.label}</span>
                <span className="mal__kpi-val">
                  {v}
                  <span className="mal__kpi-unit">%</span>
                </span>
                {seg === "A" ? (
                  <span className="mal__kpi-delta mal__kpi-delta--base">
                    kontroll-baseline
                  </span>
                ) : seg === "C" ? (
                  <span className="mal__kpi-delta mal__kpi-delta--clean">
                    +{delta} pp vs. kontroll · renere
                  </span>
                ) : (
                  <span className="mal__kpi-delta mal__kpi-delta--conf">
                    +{delta} pp vs. kontroll · konfundert
                  </span>
                )}
                <span className="mal__kpi-mini" aria-hidden>
                  {SEGS.map((s) => (
                    <span className="mal__kpi-minibar" key={s}>
                      <span
                        className={`mal__kpi-minifill mal__fill--${s.toLowerCase()}${
                          s === seg ? " mal__kpi-minifill--on" : ""
                        }`}
                        style={{ width: `${(k.vals[s] / max) * 100}%` }}
                      />
                    </span>
                  ))}
                </span>
                <span className="sr-only">
                  Kontroll {k.vals.A} %, ikke opt-in {k.vals.C} %, opt-in{" "}
                  {k.vals.B} %.
                </span>
              </div>
            );
          })}
        </div>
        <p className="mal__kpi-note">
          De tre første er funnel-steg; «tar stilling» og «uten å vente» er
          parallelle utfall. Grønt = pakke uten varsel (C) mot kontroll —
          renere, men den helt rene er <b>pakke samlet (B+C)</b> over. For B er
          gapet konfundert av seleksjon — <b>signal, ikke bevis</b>.
        </p>
      </section>

      {/* 3 — TREND */}
      <section className="mal__sec" aria-labelledby="mal-trend-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">3</span>
          <div>
            <h2 className="mal__h2" id="mal-trend-h">
              Andel med plan over tid
            </h2>
            <p className="mal__sec-sub">
              Kumulativt per uke, samme kohort. Valgt segment uthevet.
            </p>
          </div>
        </div>
        <div className="mal__panel">
          <div className="mal__legend">
            {SEGS.map((s) => (
              <span className="mal__legend-item" key={s}>
                <span
                  className={`mal__sw mal__sw--line mal__sw--${s.toLowerCase()}`}
                />
                {s} · {SEG_SHORT[s]}
              </span>
            ))}
            <span className="mal__syn">Syntetiske tall</span>
          </div>
          <svg
            className="mal__chart"
            viewBox={`0 0 ${TW} 126`}
            role="img"
            aria-label={`Linjediagram, kumulativ andel med plan per uke. Uke 8: kontroll ${TREND.A[7]} prosent, ikke opt-in ${TREND.C[7]} prosent, opt-in ${TREND.B[7]} prosent.`}
          >
            {[0, 20, 40, 60].map((g) => (
              <g key={g}>
                <line
                  x1={TL}
                  x2={TR}
                  y1={ty(g)}
                  y2={ty(g)}
                  className="mal__grid"
                />
                <text x={TL - 6} y={ty(g) + 3} className="mal__ytick">
                  {g}
                </text>
              </g>
            ))}
            {TREND_WEEKS.map((w, i) => (
              <text key={w} x={tx(i)} y={120} className="mal__xtick">
                u{w}
              </text>
            ))}
            {SEGS.map((s) => (
              <polyline
                key={s}
                points={trendStr(TREND[s])}
                className={`mal__line mal__line--${s.toLowerCase()}${
                  s === seg ? " mal__line--on" : ""
                }`}
              />
            ))}
            {SEGS.map((s) => {
              const last = TREND[s][TREND[s].length - 1];
              return (
                <g key={s}>
                  <circle
                    cx={tx(TREND_WEEKS.length - 1)}
                    cy={ty(last)}
                    r={s === seg ? 3.2 : 2.2}
                    className={`mal__dotend mal__dotend--${s.toLowerCase()}`}
                  />
                  <text
                    x={TR + 5}
                    y={ty(last) + 3}
                    className={`mal__endlbl mal__endlbl--${s.toLowerCase()}${
                      s === seg ? " mal__endlbl--on" : ""
                    }`}
                  >
                    {last}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mal__gapnote">
            Gapet over kontroll for <b>opt-in (B)</b> er delvis seleksjon — ikke
            varselets rene effekt. Den rene sammenligningen er kontroll mot
            pakke.
          </p>
          <table className="sr-only">
            <caption>Kumulativ andel med plan (%) per uke og segment</caption>
            <thead>
              <tr>
                <th>Uke</th>
                <th>Kontroll</th>
                <th>Ikke opt-in</th>
                <th>Opt-in</th>
              </tr>
            </thead>
            <tbody>
              {TREND_WEEKS.map((w, i) => (
                <tr key={w}>
                  <td>{w}</td>
                  <td>{TREND.A[i]}</td>
                  <td>{TREND.C[i]}</td>
                  <td>{TREND.B[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4 — FUNNEL */}
      <section className="mal__sec" aria-labelledby="mal-funnel-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">4</span>
          <div>
            <h2 className="mal__h2" id="mal-funnel-h">
              Funnelen — hvor vi mister folk
            </h2>
            <p className="mal__sec-sub">
              Samme kohort gjennom stegene. Alle tall = % av kohorten (steg 1 =
              100 %).
            </p>
          </div>
        </div>
        <div className="mal__panel">
          <div className="mal__legend">
            {SEGS.map((s) => (
              <span className="mal__legend-item" key={s}>
                <span className={`mal__sw mal__sw--${s.toLowerCase()}`} />
                {s} · {SEG_FULL[s]}
              </span>
            ))}
            <span className="mal__syn">Syntetiske tall</span>
          </div>
          <div className="mal__funnel">
            {FUNNEL.map((step) => (
              <div className="mal__step" key={step.label}>
                <div className="mal__step-label">
                  {step.label}
                  <span className="mal__step-sub">{step.sub}</span>
                </div>
                <div className="mal__bars">
                  {SEGS.map((s) => (
                    <div className="mal__bar" key={s}>
                      <span className="mal__bar-seg" aria-hidden>
                        {s}
                      </span>
                      <div className="mal__track">
                        <div
                          className={`mal__fill mal__fill--${s.toLowerCase()}`}
                          style={{ width: `${step.vals[s]}%` }}
                        />
                      </div>
                      <span className="mal__val">
                        <span className="sr-only">{SEG_SHORT[s]}: </span>
                        {step.vals[s]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mal__gapnote">
            <b>Hard kilde:</b> hvert steg er en registrert hendelse i basen
            (oppgave fullført, plan delt) — ikke telemetri.
            <br />
            <b>Les gapene:</b> A → C = pakka <i>uten</i> varselet (region
            avgjør). C → B = forbundet med varselet, <i>konfundert</i> av
            seleksjon. Helt rent: pakke samlet (B+C) mot kontroll.
            <br />
            <b>Merk:</b> A er en annen region (kontroll), tolket før/etter
            (diff-in-diff) — ikke en randomisert arm.
          </p>
        </div>
      </section>

      {/* 5 — MEKANISME (Lumi) */}
      <section className="mal__sec" aria-labelledby="mal-mech-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">5</span>
          <div>
            <h2 className="mal__h2" id="mal-mech-h">
              Mekanismen — møtes de tidligere og bedre?
            </h2>
            <p className="mal__sec-sub">
              Kanarifuglen: går planene opp <i>uten</i> at dette gjør det, har
              vi skapt papir, ikke dialog. Kjørt på alle segmenter — flipp til A
              for kontroll.
            </p>
          </div>
        </div>
        <div className="mal__panel">
          <div className="mal__legend">
            <span className="mal__legend-item">
              <span className="mal__sw mal__sw--ag" /> Arbeidsgiver
            </span>
            <span className="mal__legend-item">
              <span className="mal__sw mal__sw--sm" /> Den sykmeldte
            </span>
            <span className="mal__syn">
              Lumi · viser {SEG_FULL[seg]} · syntetiske
            </span>
          </div>
          <p className="sr-only">
            Tallene under gjelder segment {SEG_FULL[seg]}.
          </p>
          <div className="mal__mech">
            {MECHANISM.map((m) => {
              const mv = m.vals[seg];
              return (
                <div className="mal__mech-row" key={m.q}>
                  <span className="mal__mech-q">{m.q}</span>
                  <span className="mal__mech-actor">
                    <span className="mal__mech-track">
                      <span
                        className="mal__mech-bar mal__mech-bar--ag"
                        style={{ width: `${mv.ag}%` }}
                      />
                    </span>
                    <b>{mv.ag}%</b>
                    <i>AG</i>
                  </span>
                  <span className="mal__mech-actor">
                    <span className="mal__mech-track">
                      <span
                        className="mal__mech-bar mal__mech-bar--sm"
                        style={{ width: `${mv.sm}%` }}
                      />
                    </span>
                    <b>{mv.sm}%</b>
                    <i>sykmeldt</i>
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mal__gapnote">
            <b>«Hvorfor» måles direkte i Lumi</b> (forstår de hvorfor). Vil vi
            vite om <i>hvorfor</i> driver de harde atferdene, må vi a/b-teste
            selve hvorfor-forklaringen — ellers er det korrelasjon (de
            engasjerte både forstår og handler), samme felle som opt-in.
          </p>
        </div>
      </section>

      {/* 6 — RINGVIRKNING (lang horisont) */}
      <section className="mal__sec" aria-labelledby="mal-ripple-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">6</span>
          <div>
            <h2 className="mal__h2" id="mal-ripple-h">
              Ringvirkninger — lang horisont
            </h2>
            <p className="mal__sec-sub">
              Hard register-data, men treg og konfundert.{" "}
              <b>Bekreftende — ikke et runde-1-løfte.</b> Pakke samlet vs.
              kontroll — segment-velgeren styrer ikke dette (opt-in-splitt ville
              gjeninnført seleksjons-konfunderingen).
            </p>
          </div>
        </div>
        <div className="mal__ripple">
          {RIPPLE.map((r) => (
            <div className="mal__ripple-card" key={r.label}>
              <span className="mal__ripple-label">{r.label}</span>
              <span className="mal__ripple-sub">{r.sub}</span>
              <div className="mal__ripple-vals">
                <span className="mal__ripple-pakke">
                  {r.pakke}
                  <i>pakke</i>
                </span>
                <span className="mal__ripple-vs">vs</span>
                <span className="mal__ripple-kontroll">
                  {r.kontroll}
                  <i>kontroll</i>
                </span>
                <span className="mal__ripple-delta">{r.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7 — DATAKILDER + GUARDRAILS */}
      <section className="mal__sec" aria-labelledby="mal-src-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">7</span>
          <div>
            <h2 className="mal__h2" id="mal-src-h">
              Datakilder og guardrails
            </h2>
            <p className="mal__sec-sub">
              Hva er hard data vs. survey — og hva vi passer på underveis.
            </p>
          </div>
        </div>
        <div className="mal__two">
          <div className="mal__mini">
            <h3 className="mal__mini-h">Datakilder</h3>
            <div className="mal__srcrow">
              <span className="mal__tag mal__tag--reg">Database</span>
              <span>
                Hard: sykmeldinger m/ gradering, oppfølgingsplaner (Nav + LPS —
                to apper), veileders forespørsel (→ KR3), alle varsler per
                person, funnel-kohort. Det autoritative laget.
              </span>
            </div>
            <div className="mal__srcrow">
              <span className="mal__tag mal__tag--tel">Umami</span>
              <span>
                Trend (mykt): klikk, navigasjon, valg. Indikativt — ikke
                autoritativt, kryss-sjekkes mot Lumi.
              </span>
            </div>
            <div className="mal__srcrow">
              <span className="mal__tag mal__tag--sur">Lumi</span>
              <span>
                Survey (to: AG + sykmeldt): tillit, opplevd kontakt/press,
                tilrettelegging som funka, opt-in-opplevelse.
              </span>
            </div>
          </div>
          <div className="mal__mini">
            <h3 className="mal__mini-h">Guardrails</h3>
            <div className="mal__guardstat">
              <div>
                <b className="mal__guardstat-num">{PRESS_FELT}%</b>
                <span>opplevd press (Lumi)</span>
              </div>
            </div>
            <ul className="mal__guard">
              <li>
                <b>Ingen skjult default</b> på varsling — opt-in respekteres.
              </li>
              <li>
                <b>Varseltrøtthet = opplevd</b>: vi kan ikke flytte objektiv
                varseltrøtthet (1 varsel = dråpe i havet), så vi måler det
                opplevde presset (Lumi) mot opt-in-gevinsten.
              </li>
              <li>
                <b>Forkast</b> hvis opplevd press over kontroll + 5 pp
                (forhåndsdefinert).
              </li>
            </ul>
          </div>
        </div>
      </section>

      <p className="mal__foot">
        Dummy-dashboard · speiler <code>docs/maling-rammeverk.md</code> · alle
        tall er syntetiske
      </p>
    </div>
  );
}
