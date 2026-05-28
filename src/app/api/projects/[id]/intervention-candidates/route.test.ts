import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  withProtectedApiRoute: (handler: unknown) => handler,
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

const projectId = "11111111-1111-4111-8111-111111111111";
const candidateId = "22222222-2222-4222-8222-222222222222";
const widgetId = "33333333-3333-4333-8333-333333333333";

const context = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

function createDependencies() {
  return {
    findActiveProject: vi.fn().mockResolvedValue({ id: projectId }),
    listInterventionCandidates: vi.fn().mockResolvedValue([]),
    createInterventionCandidate: vi.fn().mockResolvedValue({
      candidateId,
    }),
  };
}

function createPostRequest(body: unknown) {
  return new Request(
    `https://example.com/api/projects/${projectId}/intervention-candidates`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

describe("/api/projects/[id]/intervention-candidates", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("GET returns dataminimized candidates with source references", async () => {
    const dependencies = createDependencies();
    dependencies.listInterventionCandidates.mockResolvedValue([
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
            widgetId,
            muralWidgetId: "mural-widget-1",
            piiRisk: "none",
          },
        ],
        createdAt: new Date("2026-05-28T10:00:00.000Z"),
        updatedAt: new Date("2026-05-28T11:00:00.000Z"),
      },
    ]);
    const { handleGetInterventionCandidates } = await import("./route");
    const { logInfo } = await import("@/lib/logger");
    const logInfoMock = vi.mocked(logInfo);

    const response = await handleGetInterventionCandidates(
      new Request(
        `https://example.com/api/projects/${projectId}/intervention-candidates`,
        {
          method: "GET",
        },
      ),
      context,
      dependencies,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      candidates: [
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
              widgetId,
              muralWidgetId: "mural-widget-1",
              piiRisk: "none",
            },
          ],
          createdAt: "2026-05-28T10:00:00.000Z",
          updatedAt: "2026-05-28T11:00:00.000Z",
        },
      ],
      callId: "call-123",
    });
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("textContent");
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("metadata");
  });

  it("GET returns 400 when projectId is invalid", async () => {
    const dependencies = createDependencies();
    const { handleGetInterventionCandidates } = await import("./route");

    const response = await handleGetInterventionCandidates(
      new Request(
        "https://example.com/api/projects/not-a-uuid/intervention-candidates",
        {
          method: "GET",
        },
      ),
      context,
      dependencies,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Ugyldig prosjekt-id",
      callId: "call-123",
    });
    expect(dependencies.findActiveProject).not.toHaveBeenCalled();
  });

  it("POST creates a candidate with URL projectId as authoritative", async () => {
    const dependencies = createDependencies();
    const { handleCreateInterventionCandidate } = await import("./route");
    const { logInfo } = await import("@/lib/logger");
    const logInfoMock = vi.mocked(logInfo);

    const response = await handleCreateInterventionCandidate(
      createPostRequest({
        title: "Tidsriktig varsel før uke 4",
        rationale: "Samler widgets om tidligere oppfølging.",
        desiredBehavior: "Arbeidsgiver vurderer oppfølgingsplan tidligere.",
        actorTrack: "Arbeidsgiver",
        journeyStep: "Uke 4",
        placementRole: "journey_step",
        widgetIds: [widgetId],
        piiConfirmed: true,
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(201);
    expect(dependencies.createInterventionCandidate).toHaveBeenCalledWith(
      {
        projectId,
        title: "Tidsriktig varsel før uke 4",
        status: "proposed",
        rationale: "Samler widgets om tidligere oppfølging.",
        desiredBehavior: "Arbeidsgiver vurderer oppfølgingsplan tidligere.",
        actorTrack: "Arbeidsgiver",
        journeyStep: "Uke 4",
        placementRole: "journey_step",
        widgetIds: [widgetId],
        piiConfirmed: true,
      },
      expect.objectContaining({ callId: "call-123" }),
    );
    await expect(response.json()).resolves.toEqual({
      candidateId,
      callId: "call-123",
    });
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain(
      "Samler widgets om tidligere oppfølging.",
    );
  });

  it("POST rejects missing PII confirmation", async () => {
    const dependencies = createDependencies();
    const { handleCreateInterventionCandidate } = await import("./route");

    const response = await handleCreateInterventionCandidate(
      createPostRequest({
        title: "Tidsriktig varsel før uke 4",
        rationale: "Samler widgets om tidligere oppfølging.",
        widgetIds: [widgetId],
        piiConfirmed: false,
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Ugyldig forespørsel",
      callId: "call-123",
      errors: [
        {
          field: "piiConfirmed",
          message: "Bekreft PII-stoppunktet før promotering.",
        },
      ],
    });
    expect(dependencies.createInterventionCandidate).not.toHaveBeenCalled();
  });

  it("POST rejects projectId and status in body as unknown fields", async () => {
    const dependencies = createDependencies();
    const { handleCreateInterventionCandidate } = await import("./route");

    const response = await handleCreateInterventionCandidate(
      createPostRequest({
        projectId,
        title: "Tidsriktig varsel før uke 4",
        status: "proposed",
        rationale: "Samler widgets om tidligere oppfølging.",
        widgetIds: [widgetId],
        piiConfirmed: true,
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Ugyldig forespørsel",
      callId: "call-123",
      errors: [
        { field: "projectId", message: "Ukjent felt" },
        { field: "status", message: "Ukjent felt" },
      ],
    });
    expect(dependencies.createInterventionCandidate).not.toHaveBeenCalled();
  });

  it("POST returns 422 when widgets do not belong to the project", async () => {
    const dependencies = createDependencies();
    const { InterventionCandidateWidgetsProjectMismatchError } = await import(
      "@/lib/intervention-candidate-service"
    );
    dependencies.createInterventionCandidate.mockRejectedValue(
      new InterventionCandidateWidgetsProjectMismatchError(),
    );
    const { handleCreateInterventionCandidate } = await import("./route");

    const response = await handleCreateInterventionCandidate(
      createPostRequest({
        title: "Tidsriktig varsel før uke 4",
        rationale: "Samler widgets om tidligere oppfølging.",
        widgetIds: [widgetId],
        piiConfirmed: true,
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      message: "Valideringsfeil",
      callId: "call-123",
      errors: [
        {
          field: "widgetIds",
          message: "Alle widgets i tiltakskandidaten må tilhøre prosjektet.",
        },
      ],
    });
  });

  it("POST returns 500 and logs sanitized metadata when creation fails", async () => {
    const dependencies = createDependencies();
    dependencies.createInterventionCandidate.mockRejectedValue(
      new Error("database offline"),
    );
    const { handleCreateInterventionCandidate } = await import("./route");
    const { logError } = await import("@/lib/logger");
    const logErrorMock = vi.mocked(logError);

    const response = await handleCreateInterventionCandidate(
      createPostRequest({
        title: "Tidsriktig varsel før uke 4",
        rationale: "Samler widgets om tidligere oppfølging.",
        widgetIds: [widgetId],
        piiConfirmed: true,
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(500);
    expect(logErrorMock).toHaveBeenCalledWith(
      "Failed to create intervention candidate",
      {
        callId: "call-123",
        path: `/api/projects/${projectId}/intervention-candidates`,
        method: "POST",
        projectId,
        error: "database offline",
      },
    );
    expect(JSON.stringify(logErrorMock.mock.calls)).not.toContain(
      "Samler widgets om tidligere oppfølging.",
    );
    expect(JSON.stringify(logErrorMock.mock.calls)).not.toContain("textContent");
    await expect(response.json()).resolves.toEqual({
      message: "Intern serverfeil",
      callId: "call-123",
    });
  });
});
