import { describe, expect, it } from "vitest";
import {
  baselineTier,
  pakke1,
  selectionTiltak,
  settMedlemskap,
} from "./tiltakspakke-utvelgelse-model";

describe("settMedlemskap", () => {
  const baseline = () => selectionTiltak.map((t) => ({ ...t }));

  it("setter tier til pakke1 når et tiltak tas inn", () => {
    // T12 er baseline 'senere'
    expect(baselineTier("T12")).toBe("senere");
    const neste = settMedlemskap(baseline(), "T12", true);
    expect(neste.find((t) => t.id === "T12")?.tier).toBe("pakke1");
  });

  it("faller tilbake til baseline-tier (vurder) når et kandidat-tiltak tas ut", () => {
    // T08 er baseline 'vurder'
    expect(baselineTier("T08")).toBe("vurder");
    const inn = settMedlemskap(baseline(), "T08", true);
    expect(inn.find((t) => t.id === "T08")?.tier).toBe("pakke1");
    const utIgjen = settMedlemskap(inn, "T08", false);
    expect(utIgjen.find((t) => t.id === "T08")?.tier).toBe("vurder");
  });

  it("faller til 'senere' når et baseline-pakke1-tiltak tas ut", () => {
    // T01 er baseline 'pakke1' (kjerne)
    expect(baselineTier("T01")).toBe("pakke1");
    const ut = settMedlemskap(baseline(), "T01", false);
    expect(ut.find((t) => t.id === "T01")?.tier).toBe("senere");
  });

  it("er rent — endrer ikke kilde-arrayet eller objektene", () => {
    const kilde = baseline();
    const t12Før = kilde.find((t) => t.id === "T12");
    const tierFør = t12Før?.tier;
    settMedlemskap(kilde, "T12", true);
    expect(t12Før?.tier).toBe(tierFør);
  });

  it("medlemskap-endring forplanter seg til pakke1()-utledningen", () => {
    const utenT12 = pakke1("ag", baseline()).map((t) => t.id);
    expect(utenT12).not.toContain("T12");
    const medT12 = pakke1("ag", settMedlemskap(baseline(), "T12", true)).map(
      (t) => t.id,
    );
    expect(medT12).toContain("T12");
  });
});
