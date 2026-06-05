import { describe, expect, it } from "vitest";
import {
  parseSegmentParam,
  SEGMENT_LABEL,
  segmentToParam,
} from "./maling-data";
import { deltaForrigePeriode, PERIODER, krSerie } from "./maling-data";
import { krStatus, samletVerdikt } from "./maling-data";
import { LUMI_MAX, LUMI_SKALA, lumiPosisjon } from "./maling-data";

describe("segment-param", () => {
  it("parser gyldig respons-param", () => {
    expect(parseSegmentParam("respons:takket-ja")).toBe("takket-ja");
    expect(parseSegmentParam("respons:ikke-svart")).toBe("ikke-svart");
  });
  it("faller tilbake til 'alle' for null/ugyldig", () => {
    expect(parseSegmentParam(null)).toBe("alle");
    expect(parseSegmentParam("respons:tull")).toBe("alle");
    expect(parseSegmentParam("annet:ja")).toBe("alle");
  });
  it("serialiserer tilbake, 'alle' gir tom streng", () => {
    expect(segmentToParam("takket-ja")).toBe("respons:takket-ja");
    expect(segmentToParam("alle")).toBe("");
  });
  it("har lesbare etiketter", () => {
    expect(SEGMENT_LABEL["takket-ja"]).toBe("Takket ja");
  });
});

describe("periode-delta", () => {
  it("regner differanse mot forrige periode", () => {
    expect(deltaForrigePeriode([30, 33, 36], 2)).toBe(3);
    expect(deltaForrigePeriode([30, 33, 36], 0)).toBe(0); // ingen forrige
  });
  it("har en uke-serie per KR med inneværende sist", () => {
    const s = krSerie("kr1");
    expect(s.length).toBe(PERIODER.length);
    expect(s.at(-1)).toBe(56); // matcher KR1 pakke-pool i dag
  });
});

describe("verdikt", () => {
  it("KR er på vei når margin >= terskel og trenden ikke faller", () => {
    expect(krStatus({ pakke: 56, kontroll: 34, forrigeDelta: 3 })).toBe("paa-vei");
  });
  it("følg-med ved liten margin eller fallende trend", () => {
    expect(krStatus({ pakke: 35, kontroll: 34, forrigeDelta: 2 })).toBe("folg-med");
    expect(krStatus({ pakke: 56, kontroll: 34, forrigeDelta: -2 })).toBe("folg-med");
  });
  it("ikke på vei når pakke ligger under kontroll", () => {
    expect(krStatus({ pakke: 30, kontroll: 34, forrigeDelta: 0 })).toBe("ikke-paa-vei");
  });
  it("samlet verdikt nedgraderes hvis mekanisme svikter (papir, ikke dult)", () => {
    const krer = ["paa-vei", "paa-vei", "paa-vei"] as const;
    expect(samletVerdikt(krer, { mekanismeOk: true, guardrailOk: true })).toBe("paa-vei");
    expect(samletVerdikt(krer, { mekanismeOk: false, guardrailOk: true })).toBe("folg-med");
  });
});

describe("lumi-skala", () => {
  it("bruker 1–5-skala (Lumi-native), via LUMI_MAX", () => {
    expect(LUMI_MAX).toBe(5);
    expect(LUMI_SKALA).toContain("1");
    expect(LUMI_SKALA).toContain("5");
  });
  it("plasserer score som prosent av 1..LUMI_MAX", () => {
    expect(lumiPosisjon(1)).toBe(0);
    expect(lumiPosisjon(3)).toBe(50);
    expect(lumiPosisjon(5)).toBe(100);
  });
});
