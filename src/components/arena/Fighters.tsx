/*
 * To håndtegnede arkade-fightere som inline-SVG. Chunky cel-shaded stil med
 * tjukke mørke konturer (leser som sprite). Bevegelige deler har klasse-kroker
 * (ar-core, ar-blip, ar-stir, ar-steam, ar-aura) som animeres fra arena.css.
 *
 *  P1  NUDGELAB  — norsk, kortklipt, mørkhåret mann i dressjakke (drar prosjektet),
 *                  side-stance vendt mot HØYRE (mot motstanderen).
 *  P2  HOVMESTER — robot-kokk med kokkelue og sløyfe, vendt mot VENSTRE.
 */

const OUTLINE = "#05030f";

/** P1 — atferdsdesigneren i dressjakke, klar i kampstilling (vender høyre). */
export function FighterNudgeLab() {
  return (
    <svg
      className="ar-fighter__svg"
      viewBox="0 0 240 360"
      role="img"
      aria-label="NudgeLab — en kortklipt mørkhåret mann i dressjakke i kampstilling"
    >
      <defs>
        <linearGradient id="nl-blazer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f4a8f" />
          <stop offset="1" stopColor="#1b2c5c" />
        </linearGradient>
        <linearGradient id="nl-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6cda3" />
          <stop offset="1" stopColor="#e3ad7f" />
        </linearGradient>
      </defs>

      <g
        stroke={OUTLINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* skygge på gulvet */}
        <ellipse
          cx="120"
          cy="346"
          rx="78"
          ry="11"
          fill="rgba(0,0,0,0.35)"
          stroke="none"
        />

        {/* bein (bukse) */}
        <path d="M90,196 L112,196 L100,330 L72,330 Z" fill="#1b2545" />
        <path d="M112,198 L132,198 L168,330 L142,330 Z" fill="#222e54" />
        {/* sko */}
        <path d="M60,330 q-6,12 8,14 l30,0 q10,-2 6,-14 Z" fill="#0e1326" />
        <path d="M138,330 q-4,12 10,14 l34,0 q10,-3 4,-15 Z" fill="#0e1326" />

        {/* dressjakke / overkropp (lener seg framover) */}
        <path
          d="M88,200 L130,206 L160,140 L150,112 L116,106 L94,150 Z"
          fill="url(#nl-blazer)"
        />
        {/* hvit skjorte + slips i fronten */}
        <path d="M118,114 L146,120 L138,176 L122,158 Z" fill="#f3f6ff" />
        <path d="M128,116 L138,118 L135,170 L131,170 Z" fill="#21e6ff" />
        {/* jakkeslag */}
        <path d="M116,108 L138,118 L120,150 Z" fill="#16234a" />
        <path d="M150,112 L139,118 L156,150 Z" fill="#16234a" />

        {/* bakre arm (cocket inntil haka) */}
        <path d="M122,118 L108,140 L120,150 L134,128 Z" fill="#243465" />
        <circle cx="138" cy="106" r="11" fill="url(#nl-skin)" />

        {/* hode */}
        <ellipse cx="158" cy="86" rx="24" ry="27" fill="url(#nl-skin)" />
        {/* øre */}
        <ellipse cx="141" cy="90" rx="6" ry="8" fill="#e3ad7f" />
        {/* kort, mørkt hår */}
        <path
          d="M134,80 Q138,52 166,54 Q184,56 182,80 Q176,70 168,72 Q160,58 148,64 Q139,68 138,86 Z"
          fill="#241d2c"
        />
        {/* ansikt: bryn, øye, nese, bestemt munn (profil mot høyre) */}
        <path
          d="M160,80 L174,82"
          stroke={OUTLINE}
          strokeWidth="3.5"
          fill="none"
        />
        <circle cx="168" cy="86" r="2.6" fill={OUTLINE} stroke="none" />
        <path d="M180,84 q6,5 0,10" fill="none" />
        <path
          d="M166,100 L176,101"
          stroke={OUTLINE}
          strokeWidth="3"
          fill="none"
        />

        {/* fremre arm (strak guard mot høyre) + dult-aura rundt neven */}
        <path
          d="M150,128 L196,142 L200,158 L156,150 Z"
          fill="url(#nl-blazer)"
        />
        <circle cx="204" cy="150" r="13" fill="url(#nl-skin)" />
        <circle
          className="ar-aura"
          cx="204"
          cy="150"
          r="20"
          fill="none"
          stroke="#21e6ff"
          strokeWidth="3"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

/** P2 — robot-kokken «Hovmester» med kokkelue, visir og visp (vender venstre). */
export function FighterHovmester() {
  return (
    <svg
      className="ar-fighter__svg"
      viewBox="0 0 240 360"
      role="img"
      aria-label="Hovmester — en robot-kokk med kokkelue og sløyfe i kampstilling"
    >
      <defs>
        <linearGradient id="hm-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfd6e4" />
          <stop offset="0.5" stopColor="#9aa3b8" />
          <stop offset="1" stopColor="#5d6679" />
        </linearGradient>
        <linearGradient id="hm-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dde3ef" />
          <stop offset="1" stopColor="#7c8499" />
        </linearGradient>
      </defs>

      <g
        stroke={OUTLINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <ellipse
          cx="120"
          cy="346"
          rx="80"
          ry="11"
          fill="rgba(0,0,0,0.35)"
          stroke="none"
        />

        {/* bein */}
        <path d="M104,206 L122,206 L100,330 L80,330 Z" fill="url(#hm-metal)" />
        <path d="M120,206 L138,206 L160,330 L140,330 Z" fill="url(#hm-metal)" />
        <rect x="70" y="328" width="40" height="18" rx="7" fill="#3b4256" />
        <rect x="134" y="328" width="42" height="18" rx="7" fill="#3b4256" />

        {/* kropp */}
        <rect
          x="84"
          y="150"
          width="76"
          height="68"
          rx="16"
          fill="url(#hm-metal)"
        />
        {/* panel-linje + nagler */}
        <path
          d="M122,156 L122,212"
          stroke={OUTLINE}
          strokeWidth="2.5"
          opacity="0.5"
          fill="none"
        />
        <circle cx="94" cy="160" r="2.4" fill={OUTLINE} stroke="none" />
        <circle cx="150" cy="160" r="2.4" fill={OUTLINE} stroke="none" />
        <circle cx="94" cy="208" r="2.4" fill={OUTLINE} stroke="none" />
        <circle cx="150" cy="208" r="2.4" fill={OUTLINE} stroke="none" />
        {/* glødende kjerne */}
        <circle cx="122" cy="186" r="13" fill="#3a2a14" />
        <circle
          className="ar-core"
          cx="122"
          cy="186"
          r="9"
          fill="#ff9a1e"
          stroke="none"
        />

        {/* maître d'-sløyfe */}
        <path d="M122,148 L104,140 L104,156 Z" fill="#ff4d3d" />
        <path d="M122,148 L140,140 L140,156 Z" fill="#ff4d3d" />
        <rect x="117" y="143" width="10" height="10" rx="2" fill="#c8261a" />

        {/* bakre arm (guard) */}
        <path d="M150,158 L176,168 L172,186 L150,176 Z" fill="url(#hm-metal)" />
        <circle cx="178" cy="184" r="11" fill="#9aa3b8" />

        {/* hode */}
        <rect
          x="96"
          y="98"
          width="54"
          height="50"
          rx="12"
          fill="url(#hm-head)"
        />
        {/* mørkt visir + glødende øyne (vendt venstre) */}
        <rect x="100" y="110" width="46" height="18" rx="5" fill="#13161f" />
        <rect
          className="ar-blip"
          x="106"
          y="115"
          width="9"
          height="8"
          rx="2"
          fill="#ff9a1e"
          stroke="none"
        />
        <rect
          className="ar-blip"
          x="120"
          y="115"
          width="9"
          height="8"
          rx="2"
          fill="#ffd23f"
          stroke="none"
        />
        {/* liten grill-munn */}
        <path
          d="M108,138 L138,138"
          stroke={OUTLINE}
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M116,135 L116,141 M124,135 L124,141 M132,135 L132,141"
          stroke={OUTLINE}
          strokeWidth="2"
          fill="none"
        />
        {/* antenne */}
        <path
          d="M123,98 L123,84"
          stroke={OUTLINE}
          strokeWidth="3"
          fill="none"
        />
        <circle className="ar-blip" cx="123" cy="80" r="5" fill="#ff4d3d" />

        {/* kokkelue */}
        <rect x="100" y="84" width="46" height="14" rx="4" fill="#fbfdff" />
        <circle cx="110" cy="80" r="14" fill="#fbfdff" />
        <circle cx="123" cy="73" r="17" fill="#fbfdff" />
        <circle cx="137" cy="80" r="14" fill="#fbfdff" />

        {/* damp opp fra lua */}
        <g stroke="none" fill="#ffffff" opacity="0.75">
          <ellipse className="ar-steam" cx="112" cy="56" rx="5" ry="7" />
          <ellipse
            className="ar-steam ar-steam--2"
            cx="126"
            cy="50"
            rx="6"
            ry="8"
          />
          <ellipse
            className="ar-steam ar-steam--3"
            cx="138"
            cy="56"
            rx="5"
            ry="7"
          />
        </g>

        {/* fremre arm (hevet, holder visp — rører) */}
        <g className="ar-stir">
          <path d="M90,160 L62,150 L58,166 L88,178 Z" fill="url(#hm-metal)" />
          <circle cx="58" cy="158" r="10" fill="#9aa3b8" />
          {/* visp */}
          <path
            d="M56,150 L44,120"
            stroke="#c2c9d6"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M44,118 q-12,-2 -10,12 q0,12 10,12 q12,0 12,-12 q0,-12 -12,-12 Z"
            fill="none"
            stroke="#c2c9d6"
            strokeWidth="3"
          />
          <path
            d="M40,108 L40,132 M48,108 L48,132"
            stroke="#c2c9d6"
            strokeWidth="2.5"
            fill="none"
          />
        </g>
      </g>
    </svg>
  );
}
