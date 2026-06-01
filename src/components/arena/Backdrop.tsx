/*
 * Scenen bak fighterne: en synthwave-arena i lag (parallax-følelse).
 * Bakerst → fremst: stjerner, sveipende lyskjegler, retro-sol, neon-skyline,
 * horisontlinje, fargede spotlights, perspektiv-gulv + scenekant, og
 * stigende gnister i forgrunnen. Alt er rent dekorativt (aria-hidden).
 */

/* Deterministisk skyline (ingen Math.random — stabilt mellom renders). */
const BUILDINGS = [
  { x: 0, w: 86, h: 118, neon: "#21e6ff" },
  { x: 90, w: 58, h: 78, neon: "#ff2d95" },
  { x: 152, w: 108, h: 162, neon: "#21e6ff" },
  { x: 264, w: 68, h: 96, neon: "#ff9a1e" },
  { x: 338, w: 92, h: 138, neon: "#ff2d95" },
  { x: 434, w: 52, h: 66, neon: "#21e6ff" },
  { x: 492, w: 132, h: 188, neon: "#21e6ff" },
  { x: 628, w: 74, h: 108, neon: "#ff9a1e" },
  { x: 706, w: 96, h: 150, neon: "#ff2d95" },
  { x: 808, w: 58, h: 86, neon: "#21e6ff" },
  { x: 872, w: 122, h: 172, neon: "#21e6ff" },
  { x: 998, w: 70, h: 104, neon: "#ff9a1e" },
  { x: 1072, w: 128, h: 134, neon: "#ff2d95" },
];

/* Stigende gnister: faste posisjoner + forskjøvet start. */
const EMBERS = [
  { l: 6, d: 0 },
  { l: 18, d: 2.4 },
  { l: 30, d: 4.1 },
  { l: 41, d: 1.2 },
  { l: 54, d: 3.3 },
  { l: 67, d: 0.7 },
  { l: 78, d: 2.9 },
  { l: 88, d: 4.8 },
  { l: 95, d: 1.8 },
];

function Skyline() {
  return (
    <svg
      className="ar-bg__skyline-svg"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      aria-hidden
    >
      <title>Neon-byhorisont</title>
      {BUILDINGS.map((b) => {
        const y = 200 - b.h;
        return (
          <g key={b.x}>
            <rect x={b.x} y={y} width={b.w} height={b.h} fill="#0a0526" />
            {/* neon-takkant */}
            <rect
              x={b.x}
              y={y}
              width={b.w}
              height="3"
              fill={b.neon}
              opacity="0.9"
            />
            {/* et par opplyste vinduer */}
            <rect
              x={b.x + 10}
              y={y + 18}
              width="6"
              height="9"
              fill="#ffd98a"
              opacity="0.55"
            />
            <rect
              x={b.x + b.w - 18}
              y={y + 30}
              width="6"
              height="9"
              fill="#ffd98a"
              opacity="0.4"
            />
            <rect
              x={b.x + b.w / 2 - 3}
              y={y + 50}
              width="6"
              height="9"
              fill="#9fe6ff"
              opacity="0.45"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function ArenaBackdrop() {
  return (
    <div className="ar-bg" aria-hidden>
      <div className="ar-bg__stars" />
      <span className="ar-beam ar-beam--1" />
      <span className="ar-beam ar-beam--2" />
      <div className="ar-bg__sun" />
      <div className="ar-bg__skyline">
        <Skyline />
      </div>
      <div className="ar-bg__horizon" />
      <div className="ar-bg__glow ar-bg__glow--p1" />
      <div className="ar-bg__glow ar-bg__glow--p2" />
      <div className="ar-bg__floor" />
      <div className="ar-bg__floorglow" />
      <div className="ar-embers">
        {EMBERS.map((e) => (
          <span
            key={`${e.l}-${e.d}`}
            className="ar-ember"
            style={{ left: `${e.l}%`, animationDelay: `${e.d}s` }}
          />
        ))}
      </div>
    </div>
  );
}
