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
