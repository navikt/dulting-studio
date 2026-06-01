"use client";

import { useEffect, useRef, useState } from "react";

export type Side = "p1" | "p2";

const FULL = 100;

/**
 * Liten «kamp-motor» for arena-introen. Barene fylles på load, kampen «armes»
 * når FIGHT! har spilt, og hvert klikk på en fighter slår motstanderen: helse
 * tappes, offeret rykker (flinch), et skadetall flyter opp, combo-telleren
 * øker, og når en bar er tom → K.O. med auto-rematch. Rent klient-leketøy.
 */
export function useBattle() {
  const [hp, setHp] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [attacker, setAttacker] = useState<Side | null>(null);
  const [victim, setVictim] = useState<Side | null>(null);
  const [dmgFx, setDmgFx] = useState<{
    side: Side;
    dmg: number;
    key: number;
  } | null>(null);
  const [clashKey, setClashKey] = useState(0);
  const [combo, setCombo] = useState(0);
  const [ko, setKo] = useState<Side | null>(null);
  const [armed, setArmed] = useState(false);

  const fxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function attack(by: Side) {
    if (!armed || ko) return;
    const target: Side = by === "p1" ? "p2" : "p1";
    const dmg = 12 + Math.floor(Math.random() * 14); // 12–25
    setAttacker(by);
    setVictim(target);
    setClashKey((k) => k + 1);
    setDmgFx((prev) => ({ side: target, dmg, key: (prev?.key ?? 0) + 1 }));
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

  return { hp, attacker, victim, dmgFx, clashKey, combo, ko, attack };
}
