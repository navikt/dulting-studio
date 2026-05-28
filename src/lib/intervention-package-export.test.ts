import { describe, expect, it } from "vitest";
import {
  buildInterventionPackageExport,
  ProbablePiiRiskExportError,
} from "./intervention-package-export";
import type { CurrentInterventionPackage } from "./intervention-package-queries";

const packageDetail: CurrentInterventionPackage = {
  package: {
    id: "22222222-2222-4222-8222-222222222222",
    projectId: "11111111-1111-4111-8111-111111111111",
    name: "Tiltakspakke 1",
    purpose: "Første kuraterte pakke.",
    status: "draft",
    createdAt: new Date("2026-05-28T10:00:00.000Z"),
    updatedAt: new Date("2026-05-28T11:00:00.000Z"),
  },
  groups: [
    {
      placementRole: "journey_step",
      label: "Reisesteg",
      candidates: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          memberId: "member-a",
          title: "Tidlig oppfølgingsplan",
          status: "proposed",
          desiredBehavior: "Arbeidsgiver starter plan tidligere.",
          rationale: "Samler lapper om tidlig oppfølging.",
          actorTrack: "Arbeidsgiver",
          journeyStep: "Uke 4",
          placementRole: "journey_step",
          assessment: "Relevant for første pakke.",
          forgoodFlags: [{ dimension: "goals", note: "Tydelig mål." }],
          openQuestions: [
            { question: "Må ordlyd juridisk sjekkes?", category: "juridisk" },
          ],
          stopCriteria: [{ criterion: "Stopp ved PII i fritekst." }],
          sourceRefs: [
            {
              widgetId: "55555555-5555-4555-8555-555555555555",
              muralWidgetId: "cell-1",
              piiRisk: "none",
              sanitizedExcerpt: "Tidlig oppfølging",
              relevanceNote: "Kilde for tidlig signal",
            },
            {
              widgetId: "66666666-6666-4666-8666-666666666666",
              muralWidgetId: "cell-2",
              piiRisk: "possible",
              sanitizedExcerpt: "Dette skal ikke ut ved mulig PII",
              relevanceNote: "Mulig PII-kilde",
            },
          ],
          addedAt: new Date("2026-05-28T12:00:00.000Z"),
        },
      ],
    },
  ],
  coverage: {
    actorTracks: ["Arbeidsgiver"],
    journeySteps: ["Uke 4"],
    cells: [
      {
        actorTrack: "Arbeidsgiver",
        journeyStep: "Uke 4",
        count: 1,
        candidateIds: ["33333333-3333-4333-8333-333333333333"],
      },
    ],
  },
};

const exportContext = {
  exportedBy: "Z123456",
  exportedAt: new Date("2026-05-28T12:30:00.000Z"),
  callId: "call-123",
};

describe("buildInterventionPackageExport", () => {
  it("builds markdown with assessment, questions, stop criteria and safe source context", () => {
    const result = buildInterventionPackageExport(
      packageDetail,
      "markdown",
      exportContext,
    );

    expect(result.contentType).toBe("text/markdown; charset=utf-8");
    expect(result.fileName).toBe(
      "tiltakspakke-22222222-2222-4222-8222-222222222222-2026-05-28.md",
    );
    expect(result.includedPiiRiskLevels).toEqual(["none", "possible"]);
    expect(result.content).toContain("# Tiltakspakke: Tiltakspakke 1");
    expect(result.content).toContain("## Dekning");
    expect(result.content).toContain("### Tidlig oppfølgingsplan");
    expect(result.content).toContain("- Vurdering: Relevant for første pakke.");
    expect(result.content).toContain("- goals: Tydelig mål.");
    expect(result.content).toContain("- Må ordlyd juridisk sjekkes? (juridisk)");
    expect(result.content).toContain("- Stopp ved PII i fritekst.");
    expect(result.content).toContain(
      "- Widget cell-1 | PII-risiko: none | Kilde for tidlig signal | Tidlig oppfølging",
    );
    expect(result.content).toContain("- Widget cell-2 | PII-risiko: possible");
    expect(result.content).not.toContain("Dette skal ikke ut ved mulig PII");
    expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("builds versioned JSON without raw or risky source excerpts", () => {
    const result = buildInterventionPackageExport(
      packageDetail,
      "json",
      exportContext,
    );
    const parsed = JSON.parse(result.content);

    expect(result.contentType).toBe("application/json; charset=utf-8");
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.package.name).toBe("Tiltakspakke 1");
    expect(parsed.groups[0].candidates[0].sources).toEqual([
      {
        widgetId: "55555555-5555-4555-8555-555555555555",
        muralWidgetId: "cell-1",
        piiRisk: "none",
        relevanceNote: "Kilde for tidlig signal",
        sanitizedExcerpt: "Tidlig oppfølging",
      },
      {
        widgetId: "66666666-6666-4666-8666-666666666666",
        muralWidgetId: "cell-2",
        piiRisk: "possible",
        relevanceNote: "Mulig PII-kilde",
        sanitizedExcerpt: null,
      },
    ]);
  });

  it("blocks export when any source has probable PII risk", () => {
    const unsafePackage: CurrentInterventionPackage = {
      ...packageDetail,
      groups: [
        {
          ...packageDetail.groups[0],
          candidates: [
            {
              ...packageDetail.groups[0].candidates[0],
              sourceRefs: [
                {
                  widgetId: "77777777-7777-4777-8777-777777777777",
                  muralWidgetId: "cell-3",
                  piiRisk: "probable",
                  sanitizedExcerpt: null,
                  relevanceNote: null,
                },
              ],
            },
          ],
        },
      ],
    };

    expect(() =>
      buildInterventionPackageExport(
        unsafePackage,
        "markdown",
        exportContext,
      ),
    ).toThrow(ProbablePiiRiskExportError);
  });
});
