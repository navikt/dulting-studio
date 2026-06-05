import { Tag } from "@navikt/ds-react";
import {
  erResponsSegment,
  PLAN_HENDELSER,
  PURRING_ANDEL,
  pakkeForSegment,
  pakkeKurveForSegment,
  SEGMENT_LABEL,
  type Segment,
  styringstallForHendelse,
  TID_TIL_PLAN_UKER,
} from "../maling-data";
import { MetricExplainer } from "./MetricExplainer";
import { SectionHead } from "./SectionHead";

// --- kurve-geometri (tid til første plan) ---
const TW = 360;
const TL = 28;
const TR = 330;
const TT = 12;
const TB = 104;
const TMAX = 72;
const tx = (i: number) => TL + (i * (TR - TL)) / (TID_TIL_PLAN_UKER.length - 1);
const ty = (v: number) => TB - (v / TMAX) * (TB - TT);
const punkter = (arr: number[]) =>
  arr.map((v, i) => `${tx(i).toFixed(1)},${ty(v).toFixed(1)}`).join(" ");
const RESPONS_SEGMENTER: Exclude<Segment, "alle">[] = ["opt-in", "ikke-opt-in"];

export function StyringstallSection({
  segment,
  onSegmentChange,
}: {
  segment: Segment;
  onSegmentChange: (segment: Segment) => void;
}) {
  const hendelse = PLAN_HENDELSER[0];
  const pakkeKurve = pakkeKurveForSegment(hendelse.id, segment);
  const pakkeSluttPlan = pakkeKurve[pakkeKurve.length - 1];
  const kontrollKurve = hendelse.kurve.kontroll;
  const kontrollSluttPlan = kontrollKurve[kontrollKurve.length - 1];
  const styringstall = styringstallForHendelse(hendelse.id);
  const pakkeLabel =
    segment === "alle" ? "Tiltakspakke samlet" : SEGMENT_LABEL[segment];

  return (
    <section className="mal__sec" aria-labelledby="mal-styring-h">
      <SectionHead num={1} headingId="mal-styring-h" title="Styringstall">
        Velg responsgruppe øverst eller i grafen. Da oppdateres tallene her og
        resten av dashboardet.
      </SectionHead>

      <div className="mal__journey-panel">
        <div>
          <h3 className="mal__eventbar-title">Planløype før uke 4</h3>
          <p className="mal__eventbar-text">
            Én fast visning av veien fra plan opprettes til den deles. Dette
            styrer ikke resten av dashboardet.
          </p>
        </div>
        <div className="mal__journey-chart">
          {PLAN_HENDELSER.map((h) => {
            const pakke = pakkeForSegment(h.styringstall.metrikk, segment);
            const kontroll = h.styringstall.metrikk.kontroll;
            return (
              <div className="mal__journey-row" key={h.id}>
                <span className="mal__journey-label">{h.label}</span>
                <div
                  className="mal__journey-bars"
                  role="img"
                  aria-label={`${h.label}: ${pakkeLabel} ${pakke} prosent, kontroll ${kontroll} prosent.`}
                >
                  <span className="mal__journey-track">
                    <span
                      className="mal__journey-fill mal__journey-fill--pakke"
                      style={{ width: `${pakke}%` }}
                    >
                      {pakke}%
                    </span>
                  </span>
                  <span className="mal__journey-track">
                    <span
                      className="mal__journey-fill mal__journey-fill--kontroll"
                      style={{ width: `${kontroll}%` }}
                    >
                      {kontroll}%
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mal__journey-legend" aria-hidden>
          <span>
            <i className="mal__response-dot mal__response-dot--opt-in" />
            {pakkeLabel}
          </span>
          <span>
            <i className="mal__response-dot mal__response-dot--kontroll" />
            Kontroll
          </span>
        </div>
      </div>

      <div className="mal__response-panel">
        <div className="mal__response-head">
          <div>
            <h3 className="mal__response-title">Respons i tiltakspakka</h3>
            <p className="mal__response-text">
              Klikk på en stolpe for å filtrere hele dashboardet. Bruk «Alle i
              tiltakspakka» øverst for å nullstille.
            </p>
          </div>
          <div className="mal__response-legend" aria-hidden>
            <span>
              <i className="mal__response-dot mal__response-dot--opt-in" />
              Takket ja
            </span>
            <span>
              <i className="mal__response-dot mal__response-dot--ikke-opt-in" />
              Ikke svart
            </span>
          </div>
        </div>
        <div className="mal__response-chart">
          {styringstall.map((s) => (
            <div className="mal__response-row" key={`${s.kr}-${s.tittel}`}>
              <span className="mal__response-metric">
                <b>{s.kr}</b>
                {s.tittel}
              </span>
              <div className="mal__response-bars">
                {RESPONS_SEGMENTER.map((respons) => {
                  const value = s.metrikk.pakke[respons];
                  const active = segment === respons;
                  return (
                    <button
                      aria-label={`Filtrer på ${SEGMENT_LABEL[respons]} for ${s.tittel}: ${value} prosent`}
                      aria-pressed={active}
                      className={`mal__response-bar mal__response-bar--${respons} ${active ? "mal__response-bar--active" : ""}`}
                      key={respons}
                      onClick={() => onSegmentChange(respons)}
                      type="button"
                    >
                      <span
                        className="mal__response-fill"
                        style={{ width: `${value}%` }}
                      >
                        <span>{value}%</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mal__kpis">
        {styringstall.map((s) => {
          const pakkeVerdi = pakkeForSegment(s.metrikk, segment);
          const delta = pakkeVerdi - s.metrikk.kontroll;
          const visRespons = erResponsSegment(segment);
          return (
            <article
              className={`mal__kpi ${visRespons ? "mal__kpi--filtered" : ""}`}
              key={s.id}
            >
              <span className="mal__kpi-sub">{s.kr}</span>
              <span className="mal__kpi-label">{s.tittel}</span>

              <div
                className="mal__cmp"
                role="img"
                aria-label={`${s.tittel}: ${pakkeLabel} ${pakkeVerdi} prosent mot kontroll ${s.metrikk.kontroll} prosent, forskjell ${delta >= 0 ? "pluss" : "minus"} ${Math.abs(delta)} prosentpoeng.`}
              >
                <div className="mal__cmp-row">
                  <span className="mal__cmp-name">{pakkeLabel}</span>
                  <span className="mal__cmp-track">
                    <span
                      className="mal__cmp-fill mal__cmp-fill--pakke"
                      style={{ width: `${pakkeVerdi}%` }}
                    />
                  </span>
                  <b className="mal__cmp-val">{pakkeVerdi}%</b>
                </div>
                <div className="mal__cmp-row">
                  <span className="mal__cmp-name">Kontroll</span>
                  <span className="mal__cmp-track">
                    <span
                      className="mal__cmp-fill mal__cmp-fill--kontroll"
                      style={{ width: `${s.metrikk.kontroll}%` }}
                    />
                  </span>
                  <b className="mal__cmp-val">{s.metrikk.kontroll}%</b>
                </div>
              </div>

              <span className="mal__kpi-delta">
                {delta >= 0 ? "+" : ""}
                {delta} pp mot kontroll
              </span>

              {visRespons && (
                <span className="mal__kpi-seg">
                  {SEGMENT_LABEL[segment]} er en responsgruppe.{" "}
                  <Tag variant="warning" size="xsmall">
                    Viser forskjell, ikke effekt
                  </Tag>
                </span>
              )}

              {s.id === "kr3" && (
                <span className="mal__kpi-sekundar">
                  Får purring: {pakkeLabel.toLowerCase()}{" "}
                  <b>{pakkeForSegment(PURRING_ANDEL, segment)}%</b> vs. kontroll{" "}
                  <b>{PURRING_ANDEL.kontroll}%</b> (lavere er bedre)
                </span>
              )}

              <MetricExplainer forklaring={s.forklaring} />
            </article>
          );
        })}
      </div>

      {/* KR1 læringsvisning: tid til første plan (survival-lignende) */}
      <div className="mal__panel mal__panel--curve">
        <div className="mal__sec-head mal__sec-head--inner">
          <div>
            <h3 className="mal__h3" id="mal-curve-h">
              KR1 over tid: {hendelse.label.toLowerCase()}
            </h3>
            <p className="mal__sec-sub">
              Viser når hendelsen skjer, uke for uke. Pakke-linja følger
              filteret ({SEGMENT_LABEL[segment]}); kontroll er fast referanse.
            </p>
          </div>
        </div>

        <div className="mal__legend">
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--line mal__sw--pakke" />
            {pakkeLabel}
          </span>
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--line mal__sw--kontroll mal__sw--dashed" />
            Kontroll
          </span>
          <span className="mal__syn">Syntetiske tall</span>
        </div>

        <svg
          className="mal__chart"
          viewBox={`0 0 ${TW} 126`}
          role="img"
          aria-labelledby="mal-curve-title mal-curve-desc"
        >
          <title id="mal-curve-title">
            {`Tid til ${hendelse.kortLabel} — ${pakkeLabel} mot kontroll`}
          </title>
          <desc id="mal-curve-desc">
            {`Linjediagram, kumulativ andel der planen er ${hendelse.kortLabel} per uke. Uke 8: ${pakkeLabel} ${pakkeSluttPlan} prosent, kontroll ${kontrollSluttPlan} prosent. Detaljer i tabellen under.`}
          </desc>
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
          {TID_TIL_PLAN_UKER.map((w, i) => (
            <text key={w} x={tx(i)} y={120} className="mal__xtick">
              u{w}
            </text>
          ))}
          {/* uke-4-frist markert */}
          <line x1={tx(3)} x2={tx(3)} y1={TT} y2={TB} className="mal__frist" />
          <text x={tx(3)} y={TT - 3} className="mal__frist-lbl">
            frist u4
          </text>
          <polyline
            points={punkter(kontrollKurve)}
            className="mal__line mal__line--kontroll mal__line--dashed"
          />
          <polyline
            points={punkter(pakkeKurve)}
            className="mal__line mal__line--pakke mal__line--on"
          />
        </svg>

        <table className="sr-only">
          <caption>
            Kumulativ andel der planen er {hendelse.kortLabel} (%) per uke.
            Pakke = {SEGMENT_LABEL[segment]}.
          </caption>
          <thead>
            <tr>
              <th>Uke</th>
              <th>Pakke</th>
              <th>Kontroll</th>
            </tr>
          </thead>
          <tbody>
            {TID_TIL_PLAN_UKER.map((w, i) => (
              <tr key={w}>
                <td>{w}</td>
                <td>{pakkeKurve[i]}</td>
                <td>{kontrollKurve[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mal__curve-explain">
          <MetricExplainer forklaring={hendelse.forklaring} />
        </div>
      </div>
    </section>
  );
}
