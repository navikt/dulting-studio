import { describe, expect, it, vi } from "vitest";
import type { ProtectedApiContext } from "./auth";
import {
  createInterventionCandidate,
  DuplicateInterventionCandidateSourceError,
  type InterventionCandidateStore,
  InterventionCandidateWidgetsProjectMismatchError,
} from "./intervention-candidate-service";
import type { CreateInterventionCandidateInput } from "./intervention-candidate-validation";

const userContext: ProtectedApiContext = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

const validPayload: CreateInterventionCandidateInput = {
  projectId: "11111111-1111-4111-8111-111111111111",
  title: "Tidsriktig varsel før uke 4",
  status: "proposed",
  desiredBehavior: "Arbeidsgiver vurderer oppfølgingsplan tidligere.",
  rationale: "Samler widgets som peker på behov for tidligere oppfølging.",
  actorTrack: "Arbeidsgiver",
  journeyStep: "Uke 4",
  placementRole: "journey_step",
  widgetIds: [
    "22222222-2222-4222-8222-222222222222",
    "33333333-3333-4333-8333-333333333333",
  ],
  piiConfirmed: true,
};

describe("createInterventionCandidate", () => {
  it("creates a candidate with one source per widget", async () => {
    const store: InterventionCandidateStore = {
      findWidgetsByIds: vi.fn().mockResolvedValue([
        {
          id: validPayload.widgetIds[0],
          muralWidgetId: "mural-a",
        },
        {
          id: validPayload.widgetIds[1],
          muralWidgetId: "mural-b",
        },
      ]),
      insertInterventionCandidate: vi.fn().mockResolvedValue({
        candidateId: "44444444-4444-4444-8444-444444444444",
      }),
    };

    const result = await createInterventionCandidate(
      store,
      validPayload,
      userContext,
    );

    expect(result).toEqual({
      candidateId: "44444444-4444-4444-8444-444444444444",
    });

    expect(store.insertInterventionCandidate).toHaveBeenCalledWith({
      candidate: expect.objectContaining({
        projectId: validPayload.projectId,
        title: validPayload.title,
        status: "proposed",
        desiredBehavior: validPayload.desiredBehavior,
        rationale: validPayload.rationale,
        actorTrack: validPayload.actorTrack,
        journeyStep: validPayload.journeyStep,
        placementRole: validPayload.placementRole,
        piiConfirmedBy: "Z123456",
        createdBy: "Z123456",
        updatedBy: "Z123456",
      }),
      sources: [
        expect.objectContaining({
          widgetId: validPayload.widgetIds[0],
          muralWidgetId: "mural-a",
          piiRisk: "none",
        }),
        expect.objectContaining({
          widgetId: validPayload.widgetIds[1],
          muralWidgetId: "mural-b",
          piiRisk: "none",
        }),
      ],
    });
  });

  it("rejects duplicate source widgets before lookup", async () => {
    const store: InterventionCandidateStore = {
      findWidgetsByIds: vi.fn(),
      insertInterventionCandidate: vi.fn(),
    };

    await expect(
      createInterventionCandidate(
        store,
        {
          ...validPayload,
          widgetIds: [validPayload.widgetIds[0], validPayload.widgetIds[0]],
        },
        userContext,
      ),
    ).rejects.toBeInstanceOf(DuplicateInterventionCandidateSourceError);

    expect(store.findWidgetsByIds).not.toHaveBeenCalled();
    expect(store.insertInterventionCandidate).not.toHaveBeenCalled();
  });

  it("rejects widgets that do not belong to the project", async () => {
    const store: InterventionCandidateStore = {
      findWidgetsByIds: vi
        .fn()
        .mockResolvedValue([{ id: validPayload.widgetIds[0] }]),
      insertInterventionCandidate: vi.fn(),
    };

    await expect(
      createInterventionCandidate(store, validPayload, userContext),
    ).rejects.toBeInstanceOf(InterventionCandidateWidgetsProjectMismatchError);

    expect(store.insertInterventionCandidate).not.toHaveBeenCalled();
  });
});
