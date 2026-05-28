import { describe, expect, it } from "vitest";
import { validateCreateInterventionCandidateBody } from "./intervention-candidate-validation";

const widgetId = "22222222-2222-4222-8222-222222222222";

const validBody = {
  title: "Tidsriktig varsel før uke 4",
  rationale: "Samler widgets som peker på behov for tidligere oppfølging.",
  desiredBehavior: "Arbeidsgiver vurderer oppfølgingsplan tidligere.",
  actorTrack: "Arbeidsgiver",
  journeyStep: "Uke 4",
  placementRole: "journey_step",
  widgetIds: [widgetId],
  piiConfirmed: true,
};

describe("validateCreateInterventionCandidateBody", () => {
  it("accepts a valid payload for one source widget", () => {
    expect(validateCreateInterventionCandidateBody(validBody)).toEqual({
      ok: true,
      data: validBody,
    });
  });

  it("rejects missing title", () => {
    expect(
      validateCreateInterventionCandidateBody({ ...validBody, title: "" }),
    ).toEqual({
      ok: false,
      errors: [{ field: "title", message: "Påkrevd felt. Maks 200 tegn." }],
    });
  });

  it("rejects missing rationale", () => {
    expect(
      validateCreateInterventionCandidateBody({ ...validBody, rationale: " " }),
    ).toEqual({
      ok: false,
      errors: [
        {
          field: "rationale",
          message: "Skriv en kort begrunnelse. Maks 1000 tegn.",
        },
      ],
    });
  });

  it("rejects HTML markup in text fields", () => {
    const result = validateCreateInterventionCandidateBody({
      ...validBody,
      title: "<strong>Varsel</strong>",
      rationale: "Kort begrunnelse",
    });

    expect(result).toEqual({
      ok: false,
      errors: [{ field: "title", message: "Må være ren tekst uten HTML" }],
    });
  });

  it("rejects unknown fields", () => {
    expect(
      validateCreateInterventionCandidateBody({
        ...validBody,
        projectId: "11111111-1111-4111-8111-111111111111",
        status: "proposed",
      }),
    ).toEqual({
      ok: false,
      errors: [
        { field: "projectId", message: "Ukjent felt" },
        { field: "status", message: "Ukjent felt" },
      ],
    });
  });

  it("rejects empty widget lists", () => {
    expect(
      validateCreateInterventionCandidateBody({
        ...validBody,
        widgetIds: [],
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          field: "widgetIds",
          message: "Må inneholde minst én widget-id",
        },
      ],
    });
  });

  it("rejects invalid widget ids", () => {
    expect(
      validateCreateInterventionCandidateBody({
        ...validBody,
        widgetIds: ["not-a-uuid"],
      }),
    ).toEqual({
      ok: false,
      errors: [{ field: "widgetIds[0]", message: "Må være en gyldig UUID" }],
    });
  });

  it("rejects duplicate widget ids", () => {
    expect(
      validateCreateInterventionCandidateBody({
        ...validBody,
        widgetIds: [widgetId, widgetId],
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          field: "widgetIds",
          message: "Kan ikke inneholde duplikate widget-id-er",
        },
      ],
    });
  });

  it("requires explicit PII confirmation", () => {
    expect(
      validateCreateInterventionCandidateBody({
        ...validBody,
        piiConfirmed: false,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          field: "piiConfirmed",
          message: "Bekreft PII-stoppunktet før promotering.",
        },
      ],
    });
  });

  it("normalizes optional blank fields to null", () => {
    expect(
      validateCreateInterventionCandidateBody({
        title: "  Tidsriktig varsel  ",
        rationale: "  Kort begrunnelse  ",
        desiredBehavior: " ",
        actorTrack: "",
        journeyStep: null,
        placementRole: "",
        widgetIds: [widgetId],
        piiConfirmed: true,
      }),
    ).toEqual({
      ok: true,
      data: {
        title: "Tidsriktig varsel",
        rationale: "Kort begrunnelse",
        desiredBehavior: null,
        actorTrack: null,
        journeyStep: null,
        placementRole: null,
        widgetIds: [widgetId],
        piiConfirmed: true,
      },
    });
  });
});
