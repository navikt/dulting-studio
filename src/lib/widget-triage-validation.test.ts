import { describe, expect, it } from "vitest";
import { validateWidgetTriageBody } from "./widget-triage-validation";

const widgetId = "22222222-2222-4222-8222-222222222222";

describe("validateWidgetTriageBody", () => {
  it("accepts a valid park request", () => {
    const result = validateWidgetTriageBody({
      widgetIds: [widgetId],
      state: "parked",
      reason: "Må avklares med fag.",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        widgetIds: [widgetId],
        state: "parked",
        reason: "Må avklares med fag.",
      },
    });
  });

  it("drops reason when reopening widgets", () => {
    const result = validateWidgetTriageBody({
      widgetIds: [widgetId],
      state: "open",
      reason: "Skal ikke lagres",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        widgetIds: [widgetId],
        state: "open",
        reason: null,
      },
    });
  });

  it("rejects unknown fields, duplicate widgets and invalid state", () => {
    const result = validateWidgetTriageBody({
      widgetIds: [widgetId, widgetId],
      state: "deleted",
      projectId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { field: "projectId", message: "Ukjent felt" },
        {
          field: "widgetIds",
          message: "Samme widget kan ikke sendes flere ganger.",
        },
        {
          field: "state",
          message: "Må være 'open', 'parked' eller 'rejected'",
        },
      ],
    });
  });

  it("rejects HTML-like reason text", () => {
    const result = validateWidgetTriageBody({
      widgetIds: [widgetId],
      state: "rejected",
      reason: "<script>",
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          field: "reason",
          message: "Maks 500 tegn og ingen HTML.",
        },
      ],
    });
  });
});
