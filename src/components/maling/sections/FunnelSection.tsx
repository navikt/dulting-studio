import {
  FUNNEL,
  pakkeForSegment,
  SEGMENT_LABEL,
  type Segment,
} from "../maling-data";
import { SectionHead } from "./SectionHead";

// Divergerende funnel-geometri: pakke til venstre for senter, kontroll til høyre.
const W = 640;
const ROW_H = 62;
const TOP = 16;
const CX = 430; // senterakse
const HALF = 160; // maks halv-lengde (verdi = 100 %) — gir plass til %-merker
const BAR_H = 22;
const sc = (v: number) => (v / 100) * HALF;

/**
 * Funnelen er et DIAGNOSEVERKTØY — viser hvor i forløpet vi mister folk, ikke
 * hovedbeviset for effekt. Divergerende form: pakke-søylen vokser til venstre,
 * kontroll til høyre fra en felles senterakse. Gapet mellom dem er pakkens løft,
 * og at begge sider smalner nedover gir funnel-formen.
 */
export function FunnelSection({ segment }: { segment: Segment }) {
  const steg = FUNNEL.map((s) => ({
    ...s,
    pakke: pakkeForSegment({ kontroll: s.kontroll, pakke: s.pakke }, segment),
  }));

  // Steget med størst fall i pakke-andel mellom to påfølgende trinn.
  let fallIdx = -1;
  let fall = 0;
  for (let i = 1; i < steg.length; i++) {
    const d = steg[i - 1].pakke - steg[i].pakke;
    if (d > fall) {
      fall = d;
      fallIdx = i;
    }
  }

  const H = TOP + steg.length * ROW_H + 6;
  const barMid = (i: number) => TOP + i * ROW_H + 38;
  const top = barMid(0) - BAR_H / 2;
  const bottom = barMid(steg.length - 1) + BAR_H / 2;

  const venstrePoly = [
    `${CX},${top}`,
    ...steg.map((s, i) => `${CX - sc(s.pakke)},${barMid(i)}`),
    `${CX},${bottom}`,
  ].join(" ");
  const høyrePoly = [
    `${CX},${top}`,
    ...steg.map((s, i) => `${CX + sc(s.kontroll)},${barMid(i)}`),
    `${CX},${bottom}`,
  ].join(" ");

  return (
    <section id="funnel" className="mal__sec" aria-labelledby="mal-funnel-h">
      <SectionHead
        num={4}
        headingId="mal-funnel-h"
        title="Hvor faller folk av?"
      >
        Pakke ({SEGMENT_LABEL[segment]}) vokser til venstre, kontroll til høyre
        — gapet er pakkens løft, og det største fallet er der flyten stopper.{" "}
        Funnelen viser andelen av kohorten som når hvert steg{" "}
        <strong>uansett når</strong> i forløpet (totalt over forløpet) — ikke
        «innen uke 4» slik KR-kortene gjør.
      </SectionHead>

      <div className="mal__panel">
        <div className="mal__legend">
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--pakke" /> Pakke ·{" "}
            {SEGMENT_LABEL[segment]}
          </span>
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--kontroll" /> Kontroll
          </span>
          <span className="mal__syn">Diagnose · syntetiske tall</span>
        </div>

        <svg
          className="mal__trakt-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="mal-funnel-t mal-funnel-d"
        >
          <title id="mal-funnel-t">Funnel: pakke mot kontroll per steg</title>
          <desc id="mal-funnel-d">
            Divergerende søyler. Pakke vokser til venstre for senterlinja,
            kontroll til høyre. Detaljer i tabellen under.
          </desc>

          <polygon
            points={venstrePoly}
            className="mal__trakt-silhuett mal__trakt-silhuett--pakke"
          />
          <polygon
            points={høyrePoly}
            className="mal__trakt-silhuett mal__trakt-silhuett--kontroll"
          />
          <line
            x1={CX}
            y1={TOP}
            x2={CX}
            y2={H - 6}
            className="mal__trakt-akse"
          />

          {steg.map((s, i) => {
            const y = barMid(i);
            const pW = sc(s.pakke);
            const kW = sc(s.kontroll);
            return (
              <g key={s.label}>
                <text x={8} y={y - BAR_H / 2 - 7} className="mal__trakt-tlabel">
                  {s.label}
                  <tspan className="mal__trakt-tsub"> · {s.sub}</tspan>
                </text>

                <rect
                  x={CX - pW}
                  y={y - BAR_H / 2}
                  width={pW}
                  height={BAR_H}
                  rx={5}
                  className="mal__trakt-rekt mal__trakt-rekt--pakke"
                />
                <text
                  x={CX - pW - 7}
                  y={y + 4}
                  textAnchor="end"
                  className="mal__trakt-tpct mal__trakt-tpct--pakke"
                >
                  {s.pakke}%
                </text>

                <rect
                  x={CX}
                  y={y - BAR_H / 2}
                  width={kW}
                  height={BAR_H}
                  rx={5}
                  className="mal__trakt-rekt mal__trakt-rekt--kontroll"
                />
                <text
                  x={CX + kW + 7}
                  y={y + 4}
                  className="mal__trakt-tpct mal__trakt-tpct--kontroll"
                >
                  {s.kontroll}%
                </text>

                {i === fallIdx && (
                  <text
                    x={W - 6}
                    y={y + 4}
                    textAnchor="end"
                    className="mal__trakt-fall"
                  >
                    ▲ Største fall
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <table className="sr-only">
          <caption>
            Andel av kohorten per steg (%). Pakke = {SEGMENT_LABEL[segment]}.
          </caption>
          <thead>
            <tr>
              <th>Steg</th>
              <th>Pakke</th>
              <th>Kontroll</th>
            </tr>
          </thead>
          <tbody>
            {steg.map((s) => (
              <tr key={s.label}>
                <td>{s.label}</td>
                <td>{s.pakke}</td>
                <td>{s.kontroll}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {fallIdx > 0 && (
          <p className="sr-only">
            Største fall: mellom {steg[fallIdx - 1].label} og{" "}
            {steg[fallIdx].label}.
          </p>
        )}

        <p className="mal__gapnote">
          <b>Les den som diagnose:</b> det største fallet mellom to steg er der
          innsatsen skal settes inn. Effekten av pakka avgjøres av
          styringstallene og lang horisont — ikke av funnel-formen alene.
        </p>
      </div>
    </section>
  );
}
