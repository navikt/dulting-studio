import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  withProtectedApiRoute: (handler: unknown) => handler,
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

const projectId = "11111111-1111-4111-8111-111111111111";
const clusterId = "22222222-2222-4222-8222-222222222222";

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
    getClusterWithWidgets: vi.fn().mockResolvedValue(null),
  };
}

describe("GET /api/projects/[id]/clusters/[clusterId]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it.each([
    {
      name: "projectId in the URL is invalid",
      url: `https://example.com/api/projects/not-a-uuid/clusters/${clusterId}`,
      message: "Ugyldig prosjekt-id",
    },
    {
      name: "clusterId in the URL is invalid",
      url: `https://example.com/api/projects/${projectId}/clusters/not-a-uuid`,
      message: "Ugyldig cluster-id",
    },
  ])("returns 400 when $name", async ({ url, message }) => {
    const dependencies = createDependencies();
    const { handleGetCluster } = await import("./route");

    const response = await handleGetCluster(
      new Request(url, {
        method: "GET",
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message,
      callId: "call-123",
    });
    expect(dependencies.findActiveProject).not.toHaveBeenCalled();
    expect(dependencies.getClusterWithWidgets).not.toHaveBeenCalled();
  });

  it("returns 404 when the cluster does not belong to the project", async () => {
    const dependencies = createDependencies();
    const { handleGetCluster } = await import("./route");

    const response = await handleGetCluster(
      new Request(
        `https://example.com/api/projects/${projectId}/clusters/${clusterId}`,
        {
          method: "GET",
        },
      ),
      context,
      dependencies,
    );

    expect(response.status).toBe(404);
    expect(dependencies.getClusterWithWidgets).toHaveBeenCalledWith(
      projectId,
      clusterId,
    );
    await expect(response.json()).resolves.toEqual({
      message: "Klyngen finnes ikke i dette prosjektet",
      callId: "call-123",
    });
  });

  it("returns minimized cluster detail with widget references only", async () => {
    const dependencies = createDependencies();
    dependencies.getClusterWithWidgets.mockResolvedValue({
      id: clusterId,
      name: "Behov i oppstartsfasen",
      summary: "Samler widgets om samme tema",
      status: "validated",
      createdAt: new Date("2024-09-01T10:00:00.000Z"),
      updatedAt: new Date("2024-09-02T11:00:00.000Z"),
      widgets: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          muralWidgetId: "mural-widget-1",
          widgetType: "text",
          textContent: `${"a".repeat(200)}…`,
        },
      ],
    });
    const { handleGetCluster } = await import("./route");
    const { logInfo } = await import("@/lib/logger");
    const logInfoMock = vi.mocked(logInfo);

    const response = await handleGetCluster(
      new Request(
        `https://example.com/api/projects/${projectId}/clusters/${clusterId}`,
        {
          method: "GET",
        },
      ),
      context,
      dependencies,
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      id: clusterId,
      name: "Behov i oppstartsfasen",
      summary: "Samler widgets om samme tema",
      status: "validated",
      createdAt: "2024-09-01T10:00:00.000Z",
      updatedAt: "2024-09-02T11:00:00.000Z",
      widgets: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          muralWidgetId: "mural-widget-1",
          widgetType: "text",
          textContent: `${"a".repeat(200)}…`,
        },
      ],
      callId: "call-123",
    });
    expect(JSON.stringify(payload)).not.toContain("metadata");
    expect(JSON.stringify(payload)).not.toContain(`${"a".repeat(201)}`);
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain(
      "Behov i oppstartsfasen",
    );
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain(
      "Samler widgets om samme tema",
    );
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("textContent");
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("metadata");
  });

  it("returns 500 and logs sanitized metadata on unexpected errors", async () => {
    const dependencies = createDependencies();
    dependencies.getClusterWithWidgets.mockRejectedValue(
      new Error("database offline"),
    );
    const { handleGetCluster } = await import("./route");
    const { logError } = await import("@/lib/logger");
    const logErrorMock = vi.mocked(logError);

    const response = await handleGetCluster(
      new Request(
        `https://example.com/api/projects/${projectId}/clusters/${clusterId}`,
        {
          method: "GET",
        },
      ),
      context,
      dependencies,
    );

    expect(response.status).toBe(500);
    expect(logErrorMock).toHaveBeenCalledWith(
      "Failed to fetch cluster detail",
      {
        callId: "call-123",
        path: `/api/projects/${projectId}/clusters/${clusterId}`,
        method: "GET",
        projectId,
        clusterId,
        error: "database offline",
      },
    );
    expect(JSON.stringify(logErrorMock.mock.calls)).not.toContain(
      "Behov i oppstartsfasen",
    );
    expect(JSON.stringify(logErrorMock.mock.calls)).not.toContain("summary");
    expect(JSON.stringify(logErrorMock.mock.calls)).not.toContain(
      "textContent",
    );
    expect(JSON.stringify(logErrorMock.mock.calls)).not.toContain("metadata");
    await expect(response.json()).resolves.toEqual({
      message: "Intern serverfeil",
      callId: "call-123",
    });
  });
});
