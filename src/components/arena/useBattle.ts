"use client";

import { useEffect, useRef, useState } from "react";

export type Side = "p1" | "p2";

export type Move = { name: string; sfx: string };

/**
 * Spesialslag knyttet til dulting i sykefraværsoppfølgingen. NudgeLab «dulter»
 * (helten), Hovmester lager byråkratisk friksjon (skurken). Navnene matcher
 * move-listene under fighterne; sfx er det tegneserie-ordet som spretter opp.
 */
const MOVES: Record<Side, Move[]> = {
  p1: [
    { name: "Tidsriktig dult", sfx: "DULT!" },
    { name: "Default-combo", sfx: "KLIKK!" },
    { name: "Forankret jab", sfx: "BAM!" },
  ],
  p2: [
    { name: "Varsel-spam", sfx: "PLING-PLING!" },
    { name: "Friksjons-grep", sfx: "KNARK!" },
    { name: "Skjema-slam", sfx: "SMELL!" },
  ],
};

const FULL = 100;

export type AttackFx = {
  attacker: Side;
  victim: Side;
  dmg: number;
  move: Move;
  key: number;
};

/**
 * Liten «kamp-motor» for arena-introen. Barene fylles på load, kampen «armes»
 * når FIGHT! har spilt, og hvert klikk på en fighter fyrer av neste spesialslag:
 * helse tappes, offeret rykker (flinch), et tegneserie-ord spretter opp, combo-
 * telleren øker, og når en bar er tom → K.O. med auto-rematch. Klient-leketøy.
 */
export function useBattle() {
  const [hp, setHp] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [attacker, setAttacker] = useState<Side | null>(null);
  const [victim, setVictim] = useState<Side | null>(null);
  const [fx, setFx] = useState<AttackFx | null>(null);
  const [clashKey, setClashKey] = useState(0);
  const [combo, setCombo] = useState(0);
  const [ko, setKo] = useState<Side | null>(null);
  const [armed, setArmed] = useState(false);

  // hvilket spesialslag som kommer neste gang, per side (sykles gjennom)
  const moveIdx = useRef<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const fxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attackRef = useRef<(by: Side) => void>(() => {});
  const [reduced, setReduced] = useState(false);

  // intro: fyll barene, og «arm» kampen etter at FIGHT! har spilt
  useEffect(() => {
    const fill = setTimeout(() => setHp({ p1: FULL, p2: FULL }), 350);
    const arm = setTimeout(() => setArmed(true), 1600);
    return () => {
      clearTimeout(fill);
      clearTimeout(arm);
    };
  }, []);

  // K.O. når en bar er tom
  useEffect(() => {
    if (!armed || ko) return;
    if (hp.p2 <= 0) setKo("p1");
    else if (hp.p1 <= 0) setKo("p2");
  }, [hp, armed, ko]);

  // auto-rematch en stund etter K.O.
  useEffect(() => {
    if (!ko) return;
    const t = setTimeout(() => {
      setKo(null);
      setCombo(0);
      setHp({ p1: FULL, p2: FULL });
    }, 3600);
    return () => clearTimeout(t);
  }, [ko]);

  // rydd timere
  useEffect(() => {
    return () => {
      if (fxTimer.current) clearTimeout(fxTimer.current);
      if (comboTimer.current) clearTimeout(comboTimer.current);
    };
  }, []);

  // respekter redusert bevegelse: da står introen stille (rolig VS-skjerm)
  useEffect(() => {
    setReduced(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // hold attackRef fersk så autopiloten alltid kaller siste versjon
  useEffect(() => {
    attackRef.current = attack;
  });

  // autopilot: fighterne sloss av seg selv (intro som spiller mens du prater).
  // Pauser ved K.O. og gjenopptas etter rematch. Av ved redusert bevegelse.
  useEffect(() => {
    if (!armed || ko || reduced) return;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const side: Side = Math.random() < 0.5 ? "p1" : "p2";
      attackRef.current(side);
      t = setTimeout(tick, 600 + Math.random() * 900);
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [armed, ko, reduced]);

  function attack(by: Side) {
    if (!armed || ko) return;
    const target: Side = by === "p1" ? "p2" : "p1";
    const moves = MOVES[by];
    const move = moves[moveIdx.current[by] % moves.length];
    moveIdx.current[by] += 1;
    const dmg = 12 + Math.floor(Math.random() * 14); // 12–25

    setAttacker(by);
    setVictim(target);
    setClashKey((k) => k + 1);
    setFx((prev) => ({
      attacker: by,
      victim: target,
      dmg,
      move,
      key: (prev?.key ?? 0) + 1,
    }));
    setHp((prev) => ({ ...prev, [target]: Math.max(0, prev[target] - dmg) }));
    setCombo((c) => c + 1);

    if (fxTimer.current) clearTimeout(fxTimer.current);
    fxTimer.current = setTimeout(() => {
      setAttacker(null);
      setVictim(null);
    }, 360);

    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setCombo(0), 1700);
  }

  return { hp, attacker, victim, fx, clashKey, combo, ko, attack };
}
