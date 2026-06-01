"use client";

import Link from "next/link";
import { ArenaBackdrop } from "./Backdrop";
import { FighterHovmester, FighterNudgeLab } from "./Fighters";
import { useBattle } from "./useBattle";
import "./arena.css";

const NAMES = { p1: "NUDGELAB", p2: "HOVMESTER" } as const;

/**
 * «Brukerreise Battle» — en tullete, ulenket arkade-intro (rute: /battle).
 * Full fighting-game-VS-skjerm: synthwave-arena, helsebarer, to fightere i
 * kampstilling, VS-smell og «FIGHT!». Klikk en fighter → den slår motstanderen
 * (helse tappes, flinch, skadetall, combo, K.O. + rematch). START → forsiden.
 */
export function ArenaView() {
  const { hp, attacker, victim, fx, clashKey, combo, ko, attack } = useBattle();

  const fighterClass = (side: "p1" | "p2") =>
    `ar-fighter ar-fighter--${side}${
      attacker === side ? " ar-fighter--lunge" : ""
    }${victim === side ? " ar-fighter--hurt" : ""}`;

  return (
    <div className={`ar-stage${attacker ? " is-shake" : ""}`}>
      {/* bakgrunn: scenen i lag */}
      <ArenaBackdrop />

      {/* topp-HUD: helsebarer */}
      <header className="ar-hud">
        <div className="ar-hud__side ar-hud__side--p1">
          <div className="ar-hud__name">NUDGELAB</div>
          <div className="ar-hud__bar">
            <span
              className="ar-hud__fill ar-hud__fill--p1"
              style={{ transform: `scaleX(${hp.p1 / 100})` }}
            />
          </div>
          <div className="ar-hud__meta">
            <span className="ar-hud__stars">★ ★ ★</span>
            <span className="ar-hud__role">Atferdsdesigneren</span>
          </div>
        </div>

        <div className="ar-hud__timer">
          <span className="ar-hud__clock">99</span>
          <span className="ar-hud__round">ROUND 1</span>
        </div>

        <div className="ar-hud__side ar-hud__side--p2">
          <div className="ar-hud__name">HOVMESTER</div>
          <div className="ar-hud__bar">
            <span
              className="ar-hud__fill ar-hud__fill--p2"
              style={{ transform: `scaleX(${hp.p2 / 100})` }}
            />
          </div>
          <div className="ar-hud__meta">
            <span className="ar-hud__stars">★ ★</span>
            <span className="ar-hud__role">Robot-kokken · CPU</span>
          </div>
        </div>
      </header>

      {/* arena: fighterne + VS */}
      <div className="ar-fighters">
        <div className={fighterClass("p1")}>
          <span className="ar-fighter__plate">▸ PLAYER 1</span>
          <button
            type="button"
            className="ar-fighter__hit"
            onClick={() => attack("p1")}
            aria-label="NudgeLab — klikk for å slå"
          >
            <FighterNudgeLab />
          </button>
          <ul className="ar-moves">
            <li>
              <span className="ar-moves__cmd">↓↘→ + P</span> Tidsriktig Dult
            </li>
            <li>
              <span className="ar-moves__cmd">→→ + K</span> Default-Combo
            </li>
            <li>
              <span className="ar-moves__cmd">↓↑ + P</span> Forankret Jab
            </li>
          </ul>
        </div>

        <div className="ar-vs">
          <span className="ar-vs__text">VS</span>
        </div>

        <div className={fighterClass("p2")}>
          <span className="ar-fighter__plate">PLAYER 2 ◂</span>
          <button
            type="button"
            className="ar-fighter__hit"
            onClick={() => attack("p2")}
            aria-label="Hovmester — klikk for å slå"
          >
            <FighterHovmester />
          </button>
          <ul className="ar-moves">
            <li>
              <span className="ar-moves__cmd">↓↘→ + P</span> Varsel-Spam
            </li>
            <li>
              <span className="ar-moves__cmd">←→ + K</span> Friksjons-Grep
            </li>
            <li>
              <span className="ar-moves__cmd">↓↓ + P</span> Skjema-Slam
            </li>
          </ul>
        </div>

        {clashKey > 0 && (
          <span
            key={`clash-${clashKey}`}
            className="ar-clash is-on"
            aria-hidden
          />
        )}

        {fx && (
          <div
            key={`sfx-${fx.key}`}
            className={`ar-sfx ar-sfx--from-${fx.attacker} ar-sfx--at-${fx.victim}`}
            aria-hidden
          >
            <span className="ar-sfx__word">{fx.move.sfx}</span>
            <span className="ar-sfx__move">
              {fx.move.name} −{fx.dmg}
            </span>
          </div>
        )}

        {combo > 1 && !ko && (
          <div key={`combo-${combo}`} className="ar-combo" aria-hidden>
            <span className="ar-combo__n">{combo}</span>
            <span className="ar-combo__lab">HITS</span>
          </div>
        )}
      </div>

      {/* «FIGHT!»-flash på load */}
      <div className="ar-fight" aria-hidden>
        <span>FIGHT!</span>
      </div>

      {/* K.O. — vises til rematch */}
      {ko && (
        <div className="ar-ko" aria-hidden>
          <span className="ar-ko__big">K.O.!</span>
          <span className="ar-ko__who">{NAMES[ko]} VINNER</span>
        </div>
      )}

      {/* bunn: tittel + START → forsiden */}
      <footer className="ar-foot">
        <h1 className="ar-title">
          BRUKERREISE <b>BATTLE</b>
        </h1>
        <Link className="ar-start" href="/">
          ▶ START
        </Link>
        <span className="ar-insert">
          INSERT COIN — TRYKK START FOR Å GÅ INN I STUDIO
        </span>
        <p className="ar-fineprint">
          Et tullete intro. De sloss av seg selv — bland deg gjerne inn ved å
          klikke en fighter. Trykk START når du er klar.
        </p>
      </footer>

      {/* CRT-overlays */}
      <div className="ar-scanlines" aria-hidden />
      <div className="ar-vignette" aria-hidden />
    </div>
  );
}
