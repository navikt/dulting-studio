import { describe, expect, it } from "vitest";
import { getTiltakProfil } from "./tiltak-provenance";
import { selectionTiltak } from "./tiltakspakke-utvelgelse-model";

describe("råkort — original tekst overalt", () => {
  it("hvert tiltak har en profil, og hvert råkort det viser har original tekst", () => {
    const utenTekst: string[] = [];
    for (const t of selectionTiltak) {
      const p = getTiltakProfil(t.id);
      expect(p, `${t.id} mangler profil`).not.toBeNull();
      for (const r of p?.raakort ?? []) {
        if (!r.tekst || r.tekst.trim().length === 0) {
          utenTekst.push(`${t.id}:${r.id}`);
        }
      }
    }
    // Ingen råkort som vises i et tiltak-kort skal være en blindvei.
    expect(utenTekst).toEqual([]);
  });

  it("ST05 viser råkortene sine med tekst (SYK-08/09 + R3/R4)", () => {
    const st05 = getTiltakProfil("ST05");
    expect(st05?.raakort.map((r) => r.id)).toContain("SYK-09");
    for (const r of st05?.raakort ?? []) {
      expect(r.tekst, `${r.id} mangler tekst`).toBeTruthy();
    }
  });

  it("støttetiltak T13/T14 har nå råkort fra dekningskartet", () => {
    expect(getTiltakProfil("T13")?.raakort.map((r) => r.id)).toEqual([
      "AG-02",
      "AG-10",
    ]);
    expect(getTiltakProfil("T14")?.raakort.map((r) => r.id)).toEqual([
      "AG-03",
      "AG-09",
      "AG-13",
      "AG-34",
    ]);
  });
});
