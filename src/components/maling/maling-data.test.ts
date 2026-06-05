import { describe, expect, it } from "vitest";
import {
  parseSegmentParam,
  SEGMENT_LABEL,
  segmentToParam,
} from "./maling-data";

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
