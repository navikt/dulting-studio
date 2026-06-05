/**
 * Survival-kurve for fraværslengde.
 *
 * Skiller seg fra SurvivalKurve:
 * - y-akse 0–100 % (andel fortsatt sykmeldt)
 * - Ingen uke-4-frist-markering
 * - Pakke ligger UNDER kontroll (raskere tilbake = lavere kurve = bedre)
 */

// --- kurve-geometri ---
const FW = 360;
const FL = 30;
const FR = 330;
const FT = 12;
const FB = 104;
const FYMAX = 100;

const fx = (i: number, n: number) => FL + (i * (FR - FL)) / (n - 1);
const fy = (v: number) => FB - (v / FYMAX) * (FB - FT);
const punkter = (arr: number[], uker: number[]) =>
  arr
    .map((v, i) => `${fx(i, uker.length).toFixed(1)},${fy(v).toFixed(1)}`)
    .join(" ");

type FravarsKurveProps = {
  survivalUker: number[];
  survivalPakke: number[];
  survivalKontroll: number[];
};

export function FravarsKurve({
  survivalUker,
  survivalPakke,
  survivalKontroll,
}: FravarsKurveProps) {
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div>
      <div className="mal__legend">
        <span className="mal__legend-item">
          <span className="mal__sw mal__sw--line mal__sw--pakke" />
          Tiltakspakke
        </span>
        <span className="mal__legend-item">
          <span className="mal__sw mal__sw--line mal__sw--kontroll mal__sw--dashed" />
          Kontroll
        </span>
        <span className="mal__syn">Syntetiske tall</span>
      </div>

      <svg
        className="mal__chart"
        viewBox={`0 0 ${FW} 128`}
        role="img"
        aria-labelledby="fravars-curve-title fravars-curve-desc"
      >
        <title id="fravars-curve-title">
          Andel fortsatt sykmeldt over tid — tiltakspakke mot kontroll
        </title>
        <desc id="fravars-curve-desc">
          {`Linjediagram, andel fortsatt sykmeldt per uke. Ved uke ${survivalUker.at(-1)}: tiltakspakke ${survivalPakke.at(-1)} prosent, kontroll ${survivalKontroll.at(-1)} prosent. Tiltakspakka faller raskere (kortere fravær). Detaljer i tabellen under.`}
        </desc>

        {/* rutenett + y-akse ticks */}
        {yTicks.map((g) => (
          <g key={g}>
            <line x1={FL} x2={FR} y1={fy(g)} y2={fy(g)} className="mal__grid" />
            <text x={FL - 6} y={fy(g) + 3} className="mal__ytick">
              {g}
            </text>
          </g>
        ))}

        {/* y-akse label (rotert) */}
        <text
          x={8}
          y={(FT + FB) / 2}
          className="mal__ytick"
          textAnchor="middle"
          transform={`rotate(-90, 8, ${(FT + FB) / 2})`}
          style={{ fontSize: "8px" }}
        >
          % sykmeldt
        </text>

        {/* x-akse ticks (uker) */}
        {survivalUker.map((w, i) => (
          <text
            key={w}
            x={fx(i, survivalUker.length)}
            y={120}
            className="mal__xtick"
          >
            u{w}
          </text>
        ))}

        {/* kontroll: stiplet */}
        <polyline
          points={punkter(survivalKontroll, survivalUker)}
          className="mal__line mal__line--kontroll mal__line--dashed"
        />

        {/* pakke: heltrukket, under kontroll */}
        <polyline
          points={punkter(survivalPakke, survivalUker)}
          className="mal__line mal__line--pakke mal__line--on"
        />
      </svg>

      {/* sr-only tabell */}
      <table className="sr-only">
        <caption>
          Andel fortsatt sykmeldt (%) per uke. Tiltakspakke mot kontroll.
        </caption>
        <thead>
          <tr>
            <th>Uke</th>
            <th>Pakke</th>
            <th>Kontroll</th>
          </tr>
        </thead>
        <tbody>
          {survivalUker.map((w, i) => (
            <tr key={w}>
              <td>{w}</td>
              <td>{survivalPakke[i]}</td>
              <td>{survivalKontroll[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mal__curve-caption">
        Raskere fall = kortere fravær. Median er ett punkt; tidslinja viser hele
        forløpet (Christians survival-poeng).
      </p>
    </div>
  );
}
