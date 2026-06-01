import { describe, expect, it } from "vitest";
import { interventionMapPhases } from "./kidult-reference-model";
import { sykmeldtMapPhases } from "./sykmeldt-reference-model";
import { getTiltakProfil, raakortText } from "./tiltak-provenance";

/** Alle råkort-koder som faktisk vises (refereres av et tiltak i kart-modellene). */
const alleRaakortIder = [
  ...new Set([
    ...interventionMapPhases
      .flatMap((p) => p.tiltak)
      .flatMap((t) => t.raakort ?? []),
    ...sykmeldtMapPhases.flatMap((p) => p.tiltak).flatMap((t) => t.raakort),
  ]),
];

describe("råkort — original tekst overalt", () => {
  it("hvert råkort et tiltak refererer til har opprinnelig tekst (ingen blindvei)", () => {
    const mangler = alleRaakortIder.filter((id) => {
      const t = raakortText(id);
      return !t || t.trim().length === 0;
    });
    expect(mangler).toEqual([]);
  });

  it("råkort-teksten vises også via det kanoniske profil-kortet", () => {
    // ST05 er bygd fra SYK-08/09 + R3/R4 — alle skal ha tekst i profilen.
    const st05 = getTiltakProfil("ST05");
    expect(st05).not.toBeNull();
    for (const r of st05?.raakort ?? []) {
      expect(r.tekst, `${r.id} mangler tekst`).toBeTruthy();
    }
  });
});
