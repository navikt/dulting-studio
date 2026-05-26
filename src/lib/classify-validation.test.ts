import { describe, expect, it } from "vitest";
import { validateClassifyBody, validateUuid } from "./classify-validation";

describe("validateUuid", () => {
  it("accepts a valid UUID", () => {
    expect(validateUuid("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(true);
  });

  it("rejects non-string", () => {
    expect(validateUuid(123)).toBe(false);
    expect(validateUuid(null)).toBe(false);
  });

  it("rejects invalid format", () => {
    expect(validateUuid("not-a-uuid")).toBe(false);
    expect(validateUuid("a1b2c3d4-e5f6-7890-abcd")).toBe(false);
  });
});

describe("validateClassifyBody", () => {
  const validBody = {
    laneTypeKey: "brukerreise",
    laneTypeLabel: "Brukerreise",
    scenario: "Søknadsprosessen",
    actorTrack: "Søker",
    journeyStep: "Fyll ut skjema",
    journeyIndex: 2,
    notes: "Viktig punkt",
    version: 1,
    expectedState: "unclassified",
  };

  it("accepts a valid complete body", () => {
    const result = validateClassifyBody(validBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.laneTypeKey).toBe("brukerreise");
      expect(result.data.version).toBe(1);
    }
  });

  it("accepts body with only required fields", () => {
    const result = validateClassifyBody({
      laneTypeKey: "test",
      laneTypeLabel: "Test",
      version: 1,
      expectedState: "unclassified",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.scenario).toBeNull();
      expect(result.data.actorTrack).toBeNull();
      expect(result.data.journeyStep).toBeNull();
      expect(result.data.journeyIndex).toBeNull();
      expect(result.data.notes).toBeNull();
      expect(result.data.expectedState).toBe("unclassified");
    }
  });

  it("rejects null body", () => {
    const result = validateClassifyBody(null);
    expect(result.ok).toBe(false);
  });

  it("rejects array body", () => {
    const result = validateClassifyBody([]);
    expect(result.ok).toBe(false);
  });

  it("rejects missing version", () => {
    const { version: _, ...noVersion } = validBody;
    const result = validateClassifyBody(noVersion);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "version")).toBe(true);
    }
  });

  it("rejects version < 1", () => {
    const result = validateClassifyBody({ ...validBody, version: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "version")).toBe(true);
    }
  });

  it("rejects non-integer version", () => {
    const result = validateClassifyBody({ ...validBody, version: 1.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "version")).toBe(true);
    }
  });

  it("rejects missing expectedState", () => {
    const { expectedState: _, ...noState } = validBody;
    const result = validateClassifyBody(noState);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "expectedState")).toBe(true);
    }
  });

  it("rejects invalid expectedState value", () => {
    const result = validateClassifyBody({
      ...validBody,
      expectedState: "bogus",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "expectedState")).toBe(true);
    }
  });

  it("accepts expectedState classified", () => {
    const result = validateClassifyBody({
      ...validBody,
      version: 3,
      expectedState: "classified",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.expectedState).toBe("classified");
    }
  });

  it("rejects missing laneTypeKey", () => {
    const { laneTypeKey: _, ...body } = validBody;
    const result = validateClassifyBody(body);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "laneTypeKey")).toBe(true);
    }
  });

  it("rejects empty laneTypeKey", () => {
    const result = validateClassifyBody({ ...validBody, laneTypeKey: "  " });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "laneTypeKey")).toBe(true);
    }
  });

  it("rejects laneTypeKey exceeding max length", () => {
    const result = validateClassifyBody({
      ...validBody,
      laneTypeKey: "a".repeat(101),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("laneTypeKey");
    }
  });

  it("rejects missing laneTypeLabel", () => {
    const { laneTypeLabel: _, ...body } = validBody;
    const result = validateClassifyBody(body);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "laneTypeLabel")).toBe(true);
    }
  });

  it("rejects unknown keys", () => {
    const result = validateClassifyBody({
      ...validBody,
      hacker: "injection",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "hacker")).toBe(true);
    }
  });

  it("rejects notes exceeding max length", () => {
    const result = validateClassifyBody({
      ...validBody,
      notes: "a".repeat(2001),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("notes");
    }
  });

  it("rejects negative journeyIndex", () => {
    const result = validateClassifyBody({ ...validBody, journeyIndex: -1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("journeyIndex");
    }
  });

  it("rejects non-integer journeyIndex", () => {
    const result = validateClassifyBody({ ...validBody, journeyIndex: 2.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("journeyIndex");
    }
  });

  it("trims whitespace from string fields", () => {
    const result = validateClassifyBody({
      ...validBody,
      laneTypeKey: "  trimmed  ",
      laneTypeLabel: "  Label  ",
      scenario: "  Scenario  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.laneTypeKey).toBe("trimmed");
      expect(result.data.laneTypeLabel).toBe("Label");
      expect(result.data.scenario).toBe("Scenario");
    }
  });

  it("treats empty optional strings as null after trim", () => {
    const result = validateClassifyBody({
      ...validBody,
      scenario: "   ",
      notes: "",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.scenario).toBeNull();
      expect(result.data.notes).toBeNull();
    }
  });

  it("accumulates multiple errors", () => {
    const result = validateClassifyBody({
      version: -1,
      laneTypeKey: "",
      laneTypeLabel: "",
      hacker: "x",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    }
  });
});
