import { describe, expect, it, vi } from "vitest";
import {
  getCurrentPackageWithCandidates,
  type InterventionPackageQueryStore,
} from "./intervention-package-queries";

const projectId = "11111111-1111-4111-8111-111111111111";
const packageId = "22222222-2222-4222-8222-222222222222";
const candidateA = "33333333-3333-4333-8333-333333333333";
const candidateB = "44444444-4444-4444-8444-444444444444";

describe("getCurrentPackageWithCandidates", () => {
  it("returns grouped package cards with coverage and dataminimized sources", async () => {
    const store: InterventionPackageQueryStore = {
      fetchCurrentPackage: vi.fn().mockResolvedValue({
        id: packageId,
        projectId,
        name: "Tiltakspakke 1",
        purpose: "Første kuraterte pakke.",
        status: "draft",
        createdAt: new Date("2026-05-28T10:00:00.000Z"),
        updatedAt: new Date("2026-05-28T11:00:00.000Z"),
      }),
      fetchMemberCandidateRows: vi.fn().mockResolvedValue([
        {
          memberId: "member-a",
          candidateId: candidateA,
          title: "Tidlig oppfølgingsplan",
          status: "proposed",
          desiredBehavior: "Arbeidsgiver starter plan tidligere.",
          rationale: "Samler lapper om tidlig oppfølging.",
          actorTrack: "Arbeidsgiver",
          journeyStep: "Uke 4",
          placementRole: "journey_step",
          assessment: "Relevant for første pakke.",
          forgoodFlags: [{ dimension: "goals", note: "Tydelig mål." }],
          openQuestions: [{ question: "Må ordlyd juridisk sjekkes?", category: "juridisk" }],
          stopCriteria: [{ criterion: "Stopp ved PII i fritekst." }],
          addedAt: new Date("2026-05-28T12:00:00.000Z"),
        },
        {
          memberId: "member-b",
          candidateId: candidateB,
          title: "Støttende plikttekst",
          status: "assessed_relevant",
          desiredBehavior: null,
          rationale: "Gir støtte på tvers.",
          actorTrack: "Arbeidsgiver",
          journeyStep: null,
          placementRole: "cross_cutting_support",
          assessment: "Bør følge hovedtiltaket som støtte.",
          forgoodFlags: [],
          openQuestions: [],
          stopCriteria: [],
          addedAt: new Date("2026-05-28T12:05:00.000Z"),
        },
      ]),
      fetchSourceRows: vi.fn().mockResolvedValue([
        {
          candidateId: candidateA,
          widgetId: "55555555-5555-4555-8555-555555555555",
          muralWidgetId: "cell-1",
          piiRisk: "none",
          sanitizedExcerpt: "Tidlig oppfølging",
          relevanceNote: "Kilde for tidlig signal",
        },
        {
          candidateId: candidateB,
          widgetId: "66666666-6666-4666-8666-666666666666",
          muralWidgetId: "cell-2",
          piiRisk: "possible",
          sanitizedExcerpt: "Skjules ved eksport",
          relevanceNote: "Støttetekst",
        },
      ]),
    };

    await expect(
      getCurrentPackageWithCandidates(store, projectId),
    ).resolves.toEqual({
      package: {
        id: packageId,
        projectId,
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
            expect.objectContaining({
              id: candidateA,
              sourceRefs: [
                {
                  widgetId: "55555555-5555-4555-8555-555555555555",
                  muralWidgetId: "cell-1",
                  piiRisk: "none",
                  sanitizedExcerpt: "Tidlig oppfølging",
                  relevanceNote: "Kilde for tidlig signal",
                },
              ],
            }),
          ],
        },
        {
          placementRole: "cross_cutting_support",
          label: "Tverrgående støtte",
          candidates: [
            expect.objectContaining({
              id: candidateB,
              sourceRefs: [
                {
                  widgetId: "66666666-6666-4666-8666-666666666666",
                  muralWidgetId: "cell-2",
                  piiRisk: "possible",
                  sanitizedExcerpt: "Skjules ved eksport",
                  relevanceNote: "Støttetekst",
                },
              ],
            }),
          ],
        },
      ],
      coverage: {
        actorTracks: ["Arbeidsgiver"],
        journeySteps: ["Uke 4", "Uplassert"],
        cells: [
          {
            actorTrack: "Arbeidsgiver",
            journeyStep: "Uke 4",
            count: 1,
            candidateIds: [candidateA],
          },
          {
            actorTrack: "Arbeidsgiver",
            journeyStep: "Uplassert",
            count: 1,
            candidateIds: [candidateB],
          },
        ],
      },
    });
  });

  it("returns null package without querying members when package is missing", async () => {
    const store: InterventionPackageQueryStore = {
      fetchCurrentPackage: vi.fn().mockResolvedValue(null),
      fetchMemberCandidateRows: vi.fn(),
      fetchSourceRows: vi.fn(),
    };

    await expect(getCurrentPackageWithCandidates(store, projectId)).resolves.toEqual(
      {
        package: null,
        groups: [],
        coverage: { actorTracks: [], journeySteps: [], cells: [] },
      },
    );
    expect(store.fetchMemberCandidateRows).not.toHaveBeenCalled();
  });
});
