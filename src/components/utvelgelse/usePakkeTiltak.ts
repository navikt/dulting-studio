"use client";

import { useEffect, useState } from "react";
import {
  type Aktor,
  avvikFraModell,
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
 * Eier hele utvelgelses-state: tiltakssettet, spor-valg, delt DB-lagring og
 * avvik mot kalibrert baseline. Modellen er alltid autoritativ; DB-en legger
 * bare på EKTE team-redigeringer (updatedBy != "seed"). Feiler DB → behold
 * modellen (klient-side what-if). Trukket ut av view-en så UI-et blir tynt.
 */
export function usePakkeTiltak() {
  const [view, setView] = useState<View>("ag");
  const [tiltak, setTiltak] = useState<SelectionTiltak[]>(() =>
    selectionTiltak.map((t) => ({ ...t })),
  );
  const [persistEnabled, setPersistEnabled] = useState(false);
  const [versions, setVersions] = useState<Record<string, number>>({});
  // hvem som sist endret hvert tiltak (kun ekte team-redigeringer, ikke seed)
  const [redigertAv, setRedigertAv] = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState("");

  const aktorFilter = view === "begge" ? undefined : view;
  const avvik = avvikFraModell(tiltak);

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
        setRedigertAv(
          Object.fromEntries(
            d.tiltak
              .filter((r) => r.updatedBy && r.updatedBy !== "seed")
              .map((r) => [r.id, r.updatedBy]),
          ),
        );
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
    setSaveMsg(`Lagrer ${id} …`);
    fetch("/api/pakke-tiltak", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...neste, version: versions[id] }),
    })
      .then((r) => r.json().then((d) => ({ status: r.status, d })))
      .then(({ status, d }) => {
        const saved = d?.tiltak as (DbRow & { updatedBy: string }) | undefined;
        if (status === 409 && saved) {
          // noen andre lagret i mellomtiden — ta inn deres verdi
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
          setVersions((v) => ({ ...v, [id]: saved.version }));
          setRedigertAv((p) => ({ ...p, [id]: saved.updatedBy }));
          setSaveMsg(`${id}: en annen lagret nettopp — viser deres verdi.`);
          return;
        }
        if (saved) {
          setVersions((v) => ({ ...v, [id]: saved.version }));
          setRedigertAv((p) => ({ ...p, [id]: saved.updatedBy }));
          setSaveMsg(`${id} lagret · ${saved.updatedBy}`);
        } else {
          setSaveMsg(`${id}: kunne ikke lagre (beholdt lokalt).`);
        }
      })
      .catch(() => setSaveMsg(`${id}: kunne ikke lagre (beholdt lokalt).`));
  }

  function reset() {
    const diverging = avvikFraModell(tiltak);
    setTiltak(selectionTiltak.map((t) => ({ ...t })));
    if (!persistEnabled || diverging.length === 0) {
      setRedigertAv({});
      setSaveMsg("");
      return;
    }
    // skriv modell-verdiene tilbake til DB for de tiltakene som avvek
    setSaveMsg("Tilbakestiller til kalibrert modell …");
    const byId = new Map(selectionTiltak.map((t) => [t.id, t]));
    Promise.allSettled(
      diverging.map((d) =>
        fetch("/api/pakke-tiltak", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...byId.get(d.id), version: versions[d.id] }),
        }),
      ),
    ).then(() => {
      setRedigertAv({});
      setSaveMsg("Tilbakestilt til kalibrert modell.");
    });
  }

  return {
    view,
    setView,
    aktorFilter,
    tiltak,
    persistEnabled,
    saveMsg,
    redigertAv,
    avvik,
    setMedlemskap,
    reset,
  };
}
