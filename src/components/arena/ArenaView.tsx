"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArenaBackdrop } from "./Backdrop";
import { FighterHovmester, FighterNudgeLab } from "./Fighters";
import "./arena.css";

type Side = "p1" | "p2";

/**
 * «Brukerreise Battle» — en tullete, ulenket arkade-intro (rute: /arena).
 * Full fighting-game-VS-skjerm: synthwave-arena, helsebarer, to fightere i
 * kampstilling, VS-smell og «FIGHT!». START dropper deg på forsiden.
 * Klikk en fighter → en liten clash (skjermrist + gnist), bare for moro.
 */
export function ArenaView() {
  const [attacking, setAttacking] = useState<Side | null>(null);
  const [clashKey, setClashKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function clash(side: Side) {
    setAttacking(side);
    setClashKey((k) => k + 1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAttacking(null), 470);
  }

  return (
    <div className={`ar-stage${attacking ? " is-shake" : ""}`}>
      {/* bakgrunn: scenen i lag */}
      <ArenaBackdrop />

      {/* topp-HUD: helsebarer */}
      <header className="ar-hud">
        <div className="ar-hud__side ar-hud__side--p1">
          <div className="ar-hud__name">NUDGELAB</div>
          <div className="ar-hud__bar">
            <span className="ar-hud__fill ar-hud__fill--p1" />
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
            <span className="ar-hud__fill ar-hud__fill--p2" />
          </div>
          <div className="ar-hud__meta">
            <span className="ar-hud__stars">★ ★</span>
            <span className="ar-hud__role">Robot-kokken · CPU</span>
          </div>
        </div>
      </header>

      {/* arena: fighterne + VS */}
      <div className="ar-fighters">
        <div
          className={`ar-fighter ar-fighter--p1${
            attacking === "p1" ? " ar-fighter--lunge" : ""
          }`}
        >
          <span className="ar-fighter__plate">▸ PLAYER 1</span>
          <button
            type="button"
            className="ar-fighter__hit"
            onClick={() => clash("p1")}
            aria-label="NudgeLab — klikk for et prøveangrep"
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

        <div
          className={`ar-fighter ar-fighter--p2${
            attacking === "p2" ? " ar-fighter--lunge" : ""
          }`}
        >
          <span className="ar-fighter__plate">PLAYER 2 ◂</span>
          <button
            type="button"
            className="ar-fighter__hit"
            onClick={() => clash("p2")}
            aria-label="Hovmester — klikk for et prøveangrep"
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
          <span key={clashKey} className="ar-clash is-on" aria-hidden />
        )}
      </div>

      {/* «FIGHT!»-flash på load */}
      <div className="ar-fight" aria-hidden>
        <span>FIGHT!</span>
      </div>

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
          Et tullete intro. Ingen roboter ble skadet. Klikk en fighter for et
          prøveangrep.
        </p>
      </footer>

      {/* CRT-overlays */}
      <div className="ar-scanlines" aria-hidden />
      <div className="ar-vignette" aria-hidden />
    </div>
  );
}
