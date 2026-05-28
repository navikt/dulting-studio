import { describe, expect, it } from "vitest";
import { validateCreateClusterBody } from "./cluster-validation";

describe("validateCreateClusterBody", () => {
  const validBody = {
    name: "Behov i oppstartsfasen",
    summary: "Samler widgets om samme tema.",
    widgetIds: [
      "22222222-2222-4222-8222-222222222222",
      "33333333-3333-4333-8333-333333333333",
    ],
  };

  it("accepts a valid payload for the public API contract", () => {
    const result = validateCreateClusterBody(validBody);

    expect(result).toEqual({
      ok: true,
      data: {
        name: validBody.name,
        summary: validBody.summary,
        widgetIds: validBody.widgetIds,
      },
    });
  });

  it("trims text fields", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      name: "  Navn  ",
      summary: "  Oppsummering  ",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Navn");
      expect(result.data.summary).toBe("Oppsummering");
    }
  });

  it("treats empty summary as null", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      summary: "   ",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.summary).toBeNull();
    }
  });

  it("rejects unknown keys", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      unexpected: true,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "unexpected",
        message: "Ukjent felt",
      });
    }
  });

  it("rejects projectId because URL projectId is authoritative", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      projectId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "projectId",
        message: "Ukjent felt",
      });
    }
  });

  it("rejects status because status is internal input only", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      status: "draft",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "status",
        message: "Ukjent felt",
      });
    }
  });

  it("rejects a name longer than 200 characters", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      name: "a".repeat(201),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "name",
        message: "Maks 200 tegn",
      });
    }
  });

  it("rejects a summary longer than 2000 characters", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      summary: "a".repeat(2001),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "summary",
        message: "Maks 2000 tegn",
      });
    }
  });

  it("rejects HTML in name", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      name: "<strong>Behov</strong>",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "name",
        message: "Må være ren tekst uten HTML",
      });
    }
  });

  it("rejects HTML in summary", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      summary: "<p>Samler widgets om samme tema.</p>",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "summary",
        message: "Må være ren tekst uten HTML",
      });
    }
  });

  it("rejects too few widget ids", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      widgetIds: [validBody.widgetIds[0]],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "widgetIds",
        message: "Må inneholde minst to widget-id-er",
      });
    }
  });

  it("rejects duplicate widget ids", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      widgetIds: [validBody.widgetIds[0], validBody.widgetIds[0]],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "widgetIds",
        message: "Kan ikke inneholde duplikate widget-id-er",
      });
      expect(result.errors).not.toContainEqual({
        field: "widgetIds",
        message: "Må inneholde minst to widget-id-er",
      });
    }
  });

  it("reports duplicate widget ids only once", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      widgetIds: [
        validBody.widgetIds[0],
        validBody.widgetIds[0],
        validBody.widgetIds[0],
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.filter(
          ({ field, message }) =>
            field === "widgetIds" &&
            message === "Kan ikke inneholde duplikate widget-id-er",
        ),
      ).toHaveLength(1);
      expect(result.errors).not.toContainEqual({
        field: "widgetIds",
        message: "Må inneholde minst to widget-id-er",
      });
    }
  });

  it("rejects duplicates without adding too few widgets after deduping", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      widgetIds: [
        validBody.widgetIds[0],
        validBody.widgetIds[0],
        validBody.widgetIds[1],
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "widgetIds",
        message: "Kan ikke inneholde duplikate widget-id-er",
      });
      expect(result.errors).not.toContainEqual({
        field: "widgetIds",
        message: "Må inneholde minst to widget-id-er",
      });
    }
  });

  it("rejects invalid widget ids", () => {
    const result = validateCreateClusterBody({
      ...validBody,
      widgetIds: ["not-a-uuid", validBody.widgetIds[1]],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        field: "widgetIds[0]",
        message: "Må være en gyldig UUID",
      });
    }
  });
});
