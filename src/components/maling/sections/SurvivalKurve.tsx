import { SEGMENT_LABEL, TID_TIL_PLAN_UKER } from "../maling-data";

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

export type SurvivalKurveProps = {
  pakkeKurve: number[];
  kontrollKurve: number[];
  pakkeLabel: string;
  kortLabel: string;
  visOptInSplitt?: boolean;
  takketJaKurve?: number[];
  ikkeSvartKurve?: number[];
};

export function SurvivalKurve({
  pakkeKurve,
  kontrollKurve,
  pakkeLabel,
  kortLabel,
  visOptInSplitt = false,
  takketJaKurve,
  ikkeSvartKurve,
}: SurvivalKurveProps) {
  const pakkeSluttPlan = pakkeKurve[pakkeKurve.length - 1];
  const kontrollSluttPlan = kontrollKurve[kontrollKurve.length - 1];

  return (
    <div>
      <div className="mal__legend">
        <span className="mal__legend-item">
          <span className="mal__sw mal__sw--line mal__sw--pakke" />
          {pakkeLabel}
        </span>
        <span className="mal__legend-item">
          <span className="mal__sw mal__sw--line mal__sw--kontroll mal__sw--dashed" />
          Kontroll
        </span>
        {visOptInSplitt && takketJaKurve && (
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--line mal__sw--split-ja" />
            {SEGMENT_LABEL["takket-ja"]}
          </span>
        )}
        {visOptInSplitt && ikkeSvartKurve && (
          <span className="mal__legend-item">
            <span className="mal__sw mal__sw--line mal__sw--split-nei" />
            {SEGMENT_LABEL["ikke-svart"]}
          </span>
        )}
        <span className="mal__syn">Syntetiske tall</span>
      </div>

      <svg
        className="mal__chart"
        viewBox={`0 0 ${TW} 126`}
        role="img"
        aria-labelledby="mal-curve-title mal-curve-desc"
      >
        <title id="mal-curve-title">
          {`Tid til ${kortLabel} — ${pakkeLabel} mot kontroll`}
        </title>
        <desc id="mal-curve-desc">
          {`Linjediagram, kumulativ andel der planen er ${kortLabel} per uke. Uke 8: ${pakkeLabel} ${pakkeSluttPlan} prosent, kontroll ${kontrollSluttPlan} prosent. Detaljer i tabellen under.`}
        </desc>

        {[0, 20, 40, 60].map((g, idx) => (
          <g key={g}>
            <line x1={TL} x2={TR} y1={ty(g)} y2={ty(g)} className="mal__grid" />
            <text x={TL - 6} y={ty(g) + 3} className="mal__ytick">
              {g}
              {/* append % unit on the top tick */}
              {idx === 3 ? "%" : ""}
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
          uke 4-frist
        </text>

        {/* kontroll: stiplet */}
        <polyline
          points={punkter(kontrollKurve)}
          className="mal__line mal__line--kontroll mal__line--dashed"
        />

        {/* pakke: heltrukkent */}
        <polyline
          points={punkter(pakkeKurve)}
          className="mal__line mal__line--pakke mal__line--on"
        />

        {/* opt-in-splitt: tynnere overlay-linjer */}
        {visOptInSplitt && takketJaKurve && (
          <polyline
            points={punkter(takketJaKurve)}
            className="mal__line mal__line--split-ja"
          />
        )}
        {visOptInSplitt && ikkeSvartKurve && (
          <polyline
            points={punkter(ikkeSvartKurve)}
            className="mal__line mal__line--split-nei"
          />
        )}
      </svg>

      <table className="sr-only">
        <caption>
          {`Kumulativ andel der planen er ${kortLabel} (%) per uke. Pakke = ${pakkeLabel}.${visOptInSplitt ? ` Inkluderer splitt: «${SEGMENT_LABEL["takket-ja"]}» og «${SEGMENT_LABEL["ikke-svart"]}».` : ""}`}
        </caption>
        <thead>
          <tr>
            <th>Uke</th>
            <th>Pakke</th>
            <th>Kontroll</th>
            {visOptInSplitt && takketJaKurve && (
              <th>{SEGMENT_LABEL["takket-ja"]}</th>
            )}
            {visOptInSplitt && ikkeSvartKurve && (
              <th>{SEGMENT_LABEL["ikke-svart"]}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {TID_TIL_PLAN_UKER.map((w, i) => (
            <tr key={w}>
              <td>{w}</td>
              <td>{pakkeKurve[i]}</td>
              <td>{kontrollKurve[i]}</td>
              {visOptInSplitt && takketJaKurve && (
                <td>{takketJaKurve[i] ?? ""}</td>
              )}
              {visOptInSplitt && ikkeSvartKurve && (
                <td>{ikkeSvartKurve[i] ?? ""}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
