"use client";

// Dummy måle-dashboard for tiltakspakke 1 — gjør målerammeverket
// (docs/maling-rammeverk.md) konkret: hvordan skjermen KUNNE sett ut, med
// A/B/C-segmentering. ALLE TALL ER SYNTETISKE. Ingen live data, ingen personer.
// Bygd inn i appen (Aksel-palett), ikke en egen tjeneste.
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import { type KrId, krLabels } from "@/lib/tiltakspakke-utvelgelse-model";
import "./maling.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

// Tre KATEGORISK ulike farger (ikke opacity på én blå) — slate / lilla / blå.
// Definert via CSS-variabler i maling.css; her holder vi rede på rekkefølge,
// etiketter og hvilken sammenligning som er ren vs. konfundert.
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

const KRS: {
  id: KrId;
  status: string;
  kind: "primary" | "off";
  data: string;
}[] = [
  {
    id: "KR1",
    status: "Primær nå",
    kind: "primary",
    data: "Hard data · register",
  },
  {
    id: "KR2",
    status: "Primær nå",
    kind: "primary",
    data: "Hard data · register",
  },
  {
    id: "KR3",
    status: "Primær nå",
    kind: "primary",
    data: "Hard data · plan- vs. forespørsel-tid",
  },
  {
    id: "KR4",
    status: "Senere satsing",
    kind: "off",
    data: "utenfor første pakke",
  },
  { id: "KR5", status: "Via lege (H2)", kind: "off", data: "indirekte · treg" },
];

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

      {/* SEGMENT-VELGER */}
      <section className="mal__sec" aria-labelledby="mal-seg-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">1</span>
          <div>
            <h2 className="mal__h2" id="mal-seg-h">
              Velg hvem tallene gjelder
            </h2>
            <p className="mal__sec-sub">
              Styrer KPI-ene og trenden under. Funnelen viser alle tre samtidig.
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
            ikke selvvalg. Dette er tallet å stole på for «virket pakka».
          </span>
        </div>
      </section>

      {/* KPI-FLISER */}
      <section className="mal__sec" aria-labelledby="mal-kpi-h">
        <h2 className="sr-only" id="mal-kpi-h">
          Nøkkeltall for valgt segment
        </h2>
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

      {/* TREND */}
      <section className="mal__sec" aria-labelledby="mal-trend-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">2</span>
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

      {/* FUNNEL */}
      <section className="mal__sec" aria-labelledby="mal-funnel-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">3</span>
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

      {/* KR-STATUS */}
      <section className="mal__sec" aria-labelledby="mal-kr-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">4</span>
          <div>
            <h2 className="mal__h2" id="mal-kr-h">
              Hvilke høynivå-mål sikter pakke 1 på?
            </h2>
            <p className="mal__sec-sub">
              Hva vi prøver å flytte nå — og hva som er bevisst utsatt. ✓ = hard
              datakilde, ikke bevist effekt.
            </p>
          </div>
        </div>
        <div className="mal__krgrid">
          {KRS.map((kr) => (
            <div className="mal__kr" key={kr.id}>
              <span className="mal__kr-code">{kr.id}</span>
              <span className="mal__kr-desc">{krLabels[kr.id]}</span>
              <span className={`mal__pill mal__pill--${kr.kind}`}>
                {kr.status}
              </span>
              <div className="mal__kr-data">
                {kr.kind === "primary" && (
                  <span className="mal__kr-check">✓</span>
                )}{" "}
                {kr.data}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DATAKILDER + GUARDRAILS */}
      <section className="mal__sec" aria-labelledby="mal-src-h">
        <div className="mal__sec-head">
          <span className="mal__sec-num">5</span>
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
              <span className="mal__tag mal__tag--reg">Hard data</span>
              <span>
                Register + base: plan laget, tidspunkt, sending til lege/Nav,
                forespørsel (→ KR3), <b>opt-in valgt, oppgave fullført</b>,
                planer per fravær, funnel-kohort. Det autoritative laget.
              </span>
            </div>
            <div className="mal__srcrow">
              <span className="mal__tag mal__tag--tel">Trend (mykt)</span>
              <span>
                Telemetri: visninger og åpninger. Indikativt — ikke
                autoritativt, ikke til styring.
              </span>
            </div>
            <div className="mal__srcrow">
              <span className="mal__tag mal__tag--sur">Survey</span>
              <span>
                Forståelse av plikt/rettigheter, opplevd press vs. støtte
                (Lumi).
              </span>
            </div>
          </div>
          <div className="mal__mini">
            <h3 className="mal__mini-h">Guardrails</h3>
            <div className="mal__guardstat">
              <div>
                <b className="mal__guardstat-num">4%</b>
                <span>avmelding av påminnelse</span>
              </div>
              <div>
                <b className="mal__guardstat-num">11%</b>
                <span>ignorerte varsel</span>
              </div>
            </div>
            <ul className="mal__guard">
              <li>
                <b>Ingen skjult default</b> på varsling — opt-in respekteres.
              </li>
              <li>
                <b>Varseltrøtthet</b> følges (tallene over) mot
                opt-in-gevinsten.
              </li>
              <li>
                <b>Forkast</b> hvis avmelding &gt; 15 % eller opplevd press ↑ i
                survey.
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
