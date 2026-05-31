import { describe, expect, it } from "vitest";
import {
  bangForBuck,
  krDekning,
  krFor,
  prioritert,
  selectionTiltak,
  tiltakKr,
} from "./tiltakspakke-utvelgelse-model";

const byId = (id: string) => {
  const t = selectionTiltak.find((x) => x.id === id);
  if (!t) throw new Error(`Fant ikke tiltak ${id}`);
  return t;
};

describe("tiltakspakke-utvelgelse-model · prioritering", () => {
  it("bangForBuck = effekt / innsats", () => {
    expect(bangForBuck(byId("T13"))).toBeCloseTo(2); // E2 / I1
    expect(bangForBuck(byId("T05"))).toBeCloseTo(1 / 2); // E1 / I2
  });

  it("prioritert sorterer synkende på bang for the buck", () => {
    const p = prioritert();
    expect(p.length).toBe(selectionTiltak.length);
    for (let i = 1; i < p.length; i++) {
      expect(bangForBuck(p[i - 1])).toBeGreaterThanOrEqual(bangForBuck(p[i]));
    }
  });

  it("alle tiltak har en KR-kobling (kan være bevisst tom)", () => {
    for (const t of selectionTiltak) {
      expect(tiltakKr).toHaveProperty(t.id);
      expect(Array.isArray(krFor(t.id))).toBe(true);
    }
  });

  it("krDekning grupperer tiltak under riktige KR-er", () => {
    const d = krDekning();
    // KR5 (gradert/lege via H2) nås av delings-/medvirkningstiltakene
    expect(d.KR5.some((t) => t.id === "T10")).toBe(true);
    expect(d.KR5.some((t) => t.id === "ST05")).toBe(true);
    // hvert tiltak i en KR-bøtte lader faktisk opp til den
    for (const [kr, tiltak] of Object.entries(d)) {
      for (const t of tiltak) {
        expect(krFor(t.id)).toContain(kr);
      }
    }
  });

  it("aktør-filter på krDekning gir bare det sporet", () => {
    const ag = krDekning("ag");
    for (const tiltak of Object.values(ag)) {
      for (const t of tiltak) expect(t.aktor).toBe("ag");
    }
  });
});
