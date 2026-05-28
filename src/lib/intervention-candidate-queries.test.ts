import { describe, expect, it, vi } from "vitest";
import {
  type InterventionCandidateQueryStore,
  listInterventionCandidates,
} from "./intervention-candidate-queries";

const projectId = "11111111-1111-4111-8111-111111111111";
const candidateId = "22222222-2222-4222-8222-222222222222";

describe("listInterventionCandidates", () => {
  it("returns dataminimized candidates with source references", async () => {
    const store: InterventionCandidateQueryStore = {
      fetchCandidateRows: vi.fn().mockResolvedValue([
        {
          id: candidateId,
          title: "Tidsriktig varsel før uke 4",
          status: "proposed",
          rationale: "Samler widgets om tidligere oppfølging.",
          actorTrack: "Arbeidsgiver",
          journeyStep: "Uke 4",
          placementRole: "journey_step",
          createdAt: new Date("2026-05-28T10:00:00.000Z"),
          updatedAt: new Date("2026-05-28T11:00:00.000Z"),
        },
      ]),
      fetchSourceRows: vi.fn().mockResolvedValue([
        {
          candidateId,
          widgetId: "33333333-3333-4333-8333-333333333333",
          muralWidgetId: "mural-widget-1",
          piiRisk: "none",
        },
      ]),
    };

    await expect(listInterventionCandidates(store, projectId)).resolves.toEqual([
      {
        id: candidateId,
        title: "Tidsriktig varsel før uke 4",
        status: "proposed",
        rationale: "Samler widgets om tidligere oppfølging.",
        actorTrack: "Arbeidsgiver",
        journeyStep: "Uke 4",
        placementRole: "journey_step",
        widgetCount: 1,
        sourceRefs: [
          {
            widgetId: "33333333-3333-4333-8333-333333333333",
            muralWidgetId: "mural-widget-1",
            piiRisk: "none",
          },
        ],
        createdAt: new Date("2026-05-28T10:00:00.000Z"),
        updatedAt: new Date("2026-05-28T11:00:00.000Z"),
      },
    ]);
  });

  it("does not query sources when there are no candidates", async () => {
    const store: InterventionCandidateQueryStore = {
      fetchCandidateRows: vi.fn().mockResolvedValue([]),
      fetchSourceRows: vi.fn(),
    };

    await expect(listInterventionCandidates(store, projectId)).resolves.toEqual(
      [],
    );
    expect(store.fetchSourceRows).not.toHaveBeenCalled();
  });
});
