"use client";

import Link from "next/link";
import { ArenaBackdrop } from "./Backdrop";
import { FighterHovmester, FighterNudgeLab } from "./Fighters";
import "./arena.css";

/**
 * «Brukerreise Battle» — rolig, ulenket arkade-intro (rute: /battle).
 * Et frosset action-panel: synthwave-scene med stille ambiens, to fightere i
 * kampstilling, og Hovmester fanget midt i et statisk «VARSEL-SPAM!»-angrep mot
 * NudgeLab. Ingen blits, ingen autopilot — bare en levende, men rolig VS-skjerm.
 * START → forsiden.
 */
export function ArenaView() {
  return (
    <div className="ar-stage">
      {/* bakgrunn: scenen i lag */}
      <ArenaBackdrop />

      {/* topp-HUD: helsebarer (fulle — bare pynt) */}
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

      {/* arena: fighterne + VS, med et frosset varsel-spam-angrep */}
      <div className="ar-fighters">
        <div className="ar-fighter ar-fighter--p1">
          <span className="ar-fighter__plate">▸ PLAYER 1</span>
          <div className="ar-fighter__fig ar-fighter__fig--recoil">
            <FighterNudgeLab />
          </div>
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

        <div className="ar-fighter ar-fighter--p2">
          <span className="ar-fighter__plate">PLAYER 2 ◂</span>
          <div className="ar-fighter__fig ar-fighter__fig--lean">
            <FighterHovmester />
          </div>
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

        {/* statisk varsel-spam-angrep, frosset over NudgeLab */}
        <div className="ar-sfx ar-sfx--from-p2 ar-sfx--at-p1" aria-hidden>
          <span className="ar-sfx__word">PLING-PLING!</span>
          <span className="ar-sfx__move">Varsel-spam</span>
        </div>
        {/* små bobler for «spam»-følelsen */}
        <span className="ar-spam ar-spam--1" aria-hidden>
          pling!
        </span>
        <span className="ar-spam ar-spam--2" aria-hidden>
          pling!
        </span>
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
          Et tullete intro mens vi kommer i gang. Trykk START for å gå inn i
          studio.
        </p>
      </footer>

      {/* CRT-overlays */}
      <div className="ar-scanlines" aria-hidden />
      <div className="ar-vignette" aria-hidden />
    </div>
  );
}
