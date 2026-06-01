"use client";

import { useEffect, useState } from "react";
import {
  type Aktor,
  type Niva,
  type SelectionTiltak,
  selectionTiltak,
  settMedlemskap as settMedlemskapPure,
  type Tier,
} from "@/lib/tiltakspakke-utvelgelse-model";

export type View = Aktor | "begge";

/** Felter fra DB-raden vi bryr oss om (superset av modellfeltene + version/updatedBy). */
type DbRow = {
  id: string;
  tier: Tier;
  effekt: Niva;
  innsats: Niva;
  kjerne: boolean;
  version: number;
  updatedBy: string;
};

/**
 * Eier utvelgelses-state: tiltakssettet, spor-valg og delt DB-lagring. Modellen
 * er alltid autoritativ; DB-en legger bare på EKTE team-redigeringer
 * (updatedBy != "seed"). Lagring skjer stille i bakgrunnen — å flytte tiltak
 * inn/ut er en helt vanlig handling, ikke et «avvik». Feiler DB → behold
 * modellen (klient-side what-if). Visningen er alltid trygg.
 */
export function usePakkeTiltak() {
  const [view, setView] = useState<View>("ag");
  const [tiltak, setTiltak] = useState<SelectionTiltak[]>(() =>
    selectionTiltak.map((t) => ({ ...t })),
  );
  const [persistEnabled, setPersistEnabled] = useState(false);
  const [versions, setVersions] = useState<Record<string, number>>({});
  const aktorFilter = view === "begge" ? undefined : view;

  useEffect(() => {
    let aktiv = true;
    fetch("/api/pakke-tiltak")
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { tiltak?: DbRow[] }) => {
        if (!aktiv || !Array.isArray(d.tiltak)) return;
        const byId = new Map(d.tiltak.map((r) => [r.id, r]));
        setVersions(Object.fromEntries(d.tiltak.map((r) => [r.id, r.version])));
        setTiltak((prev) =>
          prev.map((m) => {
            const r = byId.get(m.id);
            // overlay BARE ekte redigeringer (ikke seed) på kjente tiltak
            return r && r.updatedBy !== "seed"
              ? {
                  ...m,
                  tier: r.tier,
                  effekt: r.effekt,
                  innsats: r.innsats,
                  kjerne: r.kjerne,
                }
              : m;
          }),
        );
        setPersistEnabled(true);
      })
      .catch(() => {
        /* DB utilgjengelig → behold modellen (what-if). Visningen er trygg. */
      });
    return () => {
      aktiv = false;
    };
  }, []);

  /** Ta et tiltak inn i / ut av pakke 1. inn=false → tilbake til baseline-tier. */
  function setMedlemskap(id: string, inn: boolean) {
    const nesteListe = settMedlemskapPure(tiltak, id, inn);
    setTiltak(nesteListe);
    if (!persistEnabled) return; // klient-side what-if — ingen lagring
    const neste = nesteListe.find((x) => x.id === id);
    if (!neste) return;
    fetch("/api/pakke-tiltak", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...neste, version: versions[id] }),
    })
      .then((r) => r.json().then((d) => ({ status: r.status, d })))
      .then(({ status, d }) => {
        const saved = d?.tiltak as (DbRow & { updatedBy: string }) | undefined;
        if (!saved) return;
        if (status === 409) {
          // noen andre lagret i mellomtiden — konvergér stille mot deres verdi
          setTiltak((prev) =>
            prev.map((x) =>
              x.id === id
                ? {
                    ...x,
                    tier: saved.tier,
                    effekt: saved.effekt,
                    innsats: saved.innsats,
                    kjerne: saved.kjerne,
                  }
                : x,
            ),
          );
        }
        setVersions((v) => ({ ...v, [id]: saved.version }));
      })
      .catch(() => {
        /* lagring feilet — behold lokal verdi stille (intern demo) */
      });
  }

  return { view, setView, aktorFilter, tiltak, setMedlemskap };
}
