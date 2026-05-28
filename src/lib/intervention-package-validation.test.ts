import { describe, expect, it } from "vitest";
import {
  validateAddPackageMemberBody,
  validateExportPackageBody,
} from "./intervention-package-validation";

const candidateId = "22222222-2222-4222-8222-222222222222";

describe("validateAddPackageMemberBody", () => {
  it("accepts a dataminimized package assessment after PII confirmation", () => {
    expect(
      validateAddPackageMemberBody({
        candidateId,
        assessment: "Relevant for første pakke fordi tiltaket kan gi tidligere oppfølging.",
        forgoodFlags: [
          {
            dimension: "goals",
            note: "Målet er tydelig koblet til tidligere dialog.",
          },
        ],
        openQuestions: [
          {
            question: "Må jurist se på ordlyden før test?",
            category: "juridisk",
          },
        ],
        stopCriteria: [
          {
            criterion: "Stopp hvis tiltaket gir flere fritekstsvar med PII.",
          },
        ],
        piiConfirmed: true,
      }),
    ).toEqual({
      ok: true,
      data: {
        candidateId,
        assessment:
          "Relevant for første pakke fordi tiltaket kan gi tidligere oppfølging.",
        forgoodFlags: [
          {
            dimension: "goals",
            note: "Målet er tydelig koblet til tidligere dialog.",
          },
        ],
        openQuestions: [
          {
            question: "Må jurist se på ordlyden før test?",
            category: "juridisk",
          },
        ],
        stopCriteria: [
          {
            criterion: "Stopp hvis tiltaket gir flere fritekstsvar med PII.",
          },
        ],
        piiConfirmed: true,
      },
    });
  });

  it("rejects missing PII confirmation", () => {
    expect(
      validateAddPackageMemberBody({
        candidateId,
        assessment: "Relevant for første pakke.",
        piiConfirmed: false,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          field: "piiConfirmed",
          message: "Bekreft PII-stoppunktet før tiltaket legges i pakken.",
        },
      ],
    });
  });

  it("rejects unknown fields and invalid candidate id", () => {
    expect(
      validateAddPackageMemberBody({
        candidateId: "ikke-uuid",
        assessment: "Relevant for første pakke.",
        projectId: "11111111-1111-4111-8111-111111111111",
        piiConfirmed: true,
      }),
    ).toEqual({
      ok: false,
      errors: [
        { field: "projectId", message: "Ukjent felt" },
        { field: "candidateId", message: "Må være en gyldig UUID" },
      ],
    });
  });

  it("rejects HTML-like markup in free text fields", () => {
    const result = validateAddPackageMemberBody({
      candidateId,
      assessment: "Relevant <script>alert(1)</script>",
      forgoodFlags: [{ dimension: "respect", note: "<b>Obs</b>" }],
      openQuestions: [{ question: "<em>Avklaring?</em>" }],
      stopCriteria: [{ criterion: "<span>Stopp</span>" }],
      piiConfirmed: true,
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { field: "assessment", message: "Må være ren tekst uten HTML" },
        { field: "forgoodFlags[0].note", message: "Må være ren tekst uten HTML" },
        {
          field: "openQuestions[0].question",
          message: "Må være ren tekst uten HTML",
        },
        {
          field: "stopCriteria[0].criterion",
          message: "Må være ren tekst uten HTML",
        },
      ],
    });
  });

  it("rejects invalid FORGOOD dimensions", () => {
    expect(
      validateAddPackageMemberBody({
        candidateId,
        assessment: "Relevant for første pakke.",
        forgoodFlags: [{ dimension: "score", note: "Ikke bruk totalscore." }],
        piiConfirmed: true,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          field: "forgoodFlags[0].dimension",
          message: "Ugyldig FORGOOD-dimensjon",
        },
      ],
    });
  });
});

describe("validateExportPackageBody", () => {
  it("accepts markdown and json export after PII confirmation", () => {
    expect(
      validateExportPackageBody({
        format: "markdown",
        piiExportConfirmed: true,
      }),
    ).toEqual({
      ok: true,
      data: { format: "markdown", piiExportConfirmed: true },
    });

    expect(
      validateExportPackageBody({
        format: "json",
        piiExportConfirmed: true,
      }),
    ).toEqual({
      ok: true,
      data: { format: "json", piiExportConfirmed: true },
    });
  });

  it("rejects export without explicit PII confirmation", () => {
    expect(
      validateExportPackageBody({
        format: "markdown",
        piiExportConfirmed: false,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          field: "piiExportConfirmed",
          message: "Bekreft PII-stoppunktet før eksport.",
        },
      ],
    });
  });

  it("rejects unsupported export format", () => {
    expect(
      validateExportPackageBody({
        format: "pdf",
        piiExportConfirmed: true,
      }),
    ).toEqual({
      ok: false,
      errors: [{ field: "format", message: "Velg Markdown eller JSON" }],
    });
  });
});
