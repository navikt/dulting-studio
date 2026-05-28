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
const widgetId = "22222222-2222-4222-8222-222222222222";

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
    setWidgetTriage: vi.fn().mockResolvedValue({
      widgetIds: [widgetId],
      state: "parked",
    }),
  };
}

function createPostRequest(body: unknown, id = projectId) {
  return new Request(`https://example.com/api/projects/${id}/widgets/triage`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/projects/[id]/widgets/triage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns 400 when projectId is invalid", async () => {
    const dependencies = createDependencies();
    const { handleSetWidgetTriage } = await import("./route");

    const response = await handleSetWidgetTriage(
      createPostRequest({ widgetIds: [widgetId], state: "parked" }, "bad-id"),
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

  it("rejects invalid payload before project lookup", async () => {
    const dependencies = createDependencies();
    const { handleSetWidgetTriage } = await import("./route");

    const response = await handleSetWidgetTriage(
      createPostRequest({
        widgetIds: [widgetId, widgetId],
        state: "deleted",
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
          field: "widgetIds",
          message: "Samme widget kan ikke sendes flere ganger.",
        },
        {
          field: "state",
          message: "Må være 'open', 'parked' eller 'rejected'",
        },
      ],
    });
    expect(dependencies.findActiveProject).not.toHaveBeenCalled();
  });

  it("sets triage state with URL projectId as authoritative value", async () => {
    const dependencies = createDependencies();
    const { handleSetWidgetTriage } = await import("./route");
    const { logInfo } = await import("@/lib/logger");

    const response = await handleSetWidgetTriage(
      createPostRequest({
        widgetIds: [widgetId],
        state: "parked",
        reason: "Må avklares med fag",
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(200);
    expect(dependencies.setWidgetTriage).toHaveBeenCalledWith(
      projectId,
      {
        widgetIds: [widgetId],
        state: "parked",
        reason: "Må avklares med fag",
      },
      expect.objectContaining({ callId: "call-123" }),
    );
    await expect(response.json()).resolves.toEqual({
      widgetIds: [widgetId],
      state: "parked",
      callId: "call-123",
    });
    expect(logInfo).toHaveBeenCalledWith("Updated widget triage", {
      callId: "call-123",
      path: `/api/projects/${projectId}/widgets/triage`,
      method: "POST",
      projectId,
      state: "parked",
      widgetCount: 1,
    });
    expect(JSON.stringify(vi.mocked(logInfo).mock.calls)).not.toContain(
      "Må avklares",
    );
  });

  it("returns 422 when widgets do not belong to the project", async () => {
    const dependencies = createDependencies();
    const { WidgetTriageWidgetsProjectMismatchError } = await import(
      "@/lib/widget-triage-service"
    );
    dependencies.setWidgetTriage.mockRejectedValue(
      new WidgetTriageWidgetsProjectMismatchError(),
    );
    const { handleSetWidgetTriage } = await import("./route");

    const response = await handleSetWidgetTriage(
      createPostRequest({ widgetIds: [widgetId], state: "rejected" }),
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
          message: "Alle widgets må tilhøre prosjektet.",
        },
      ],
    });
  });
});
