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
    listClusters: vi.fn().mockResolvedValue([]),
    createCluster: vi.fn().mockResolvedValue({
      clusterId: "22222222-2222-4222-8222-222222222222",
    }),
  };
}

function createPostRequest(body: unknown) {
  return new Request(`https://example.com/api/projects/${projectId}/clusters`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("/api/projects/[id]/clusters", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("GET returns 400 when projectId in the URL is invalid", async () => {
    const dependencies = createDependencies();
    const { handleGetClusters } = await import("./route");

    const response = await handleGetClusters(
      new Request("https://example.com/api/projects/not-a-uuid/clusters", {
        method: "GET",
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Ugyldig prosjekt-id",
      callId: "call-123",
    });
    expect(dependencies.findActiveProject).not.toHaveBeenCalled();
    expect(dependencies.listClusters).not.toHaveBeenCalled();
  });

  it("GET returns minimized cluster list without widget text or summary", async () => {
    const dependencies = createDependencies();
    dependencies.listClusters.mockResolvedValue([
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Behov i oppstartsfasen",
        status: "draft",
        widgetCount: 3,
        createdAt: new Date("2024-09-01T10:00:00.000Z"),
        updatedAt: new Date("2024-09-02T11:00:00.000Z"),
      },
    ]);
    const { handleGetClusters } = await import("./route");
    const { logInfo } = await import("@/lib/logger");
    const logInfoMock = vi.mocked(logInfo);

    const response = await handleGetClusters(
      new Request(`https://example.com/api/projects/${projectId}/clusters`, {
        method: "GET",
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      clusters: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Behov i oppstartsfasen",
          status: "draft",
          widgetCount: 3,
          createdAt: "2024-09-01T10:00:00.000Z",
          updatedAt: "2024-09-02T11:00:00.000Z",
        },
      ],
      callId: "call-123",
    });
    expect(logInfoMock).toHaveBeenCalledWith("Served cluster list", {
      callId: "call-123",
      path: `/api/projects/${projectId}/clusters`,
      method: "GET",
      projectId,
      resultCount: 1,
    });
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("summary");
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("textContent");
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("metadata");
  });

  it("GET returns 404 when the project does not exist", async () => {
    const dependencies = createDependencies();
    dependencies.findActiveProject.mockResolvedValue(null);
    const { handleGetClusters } = await import("./route");

    const response = await handleGetClusters(
      new Request(`https://example.com/api/projects/${projectId}/clusters`, {
        method: "GET",
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "Prosjektet finnes ikke",
      callId: "call-123",
    });
    expect(dependencies.listClusters).not.toHaveBeenCalled();
  });

  it("POST rejects projectId in body as an unknown field", async () => {
    const dependencies = createDependencies();
    const { handleCreateCluster } = await import("./route");

    const response = await handleCreateCluster(
      createPostRequest({
        projectId,
        name: "Behov i oppstartsfasen",
        summary: "Skal avvises",
        widgetIds: [
          "33333333-3333-4333-8333-333333333333",
          "44444444-4444-4444-8444-444444444444",
        ],
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
          field: "projectId",
          message: "Ukjent felt",
        },
      ],
    });
    expect(dependencies.createCluster).not.toHaveBeenCalled();
  });

  it("POST rejects status in body as an unknown field", async () => {
    const dependencies = createDependencies();
    const { handleCreateCluster } = await import("./route");

    const response = await handleCreateCluster(
      createPostRequest({
        name: "Behov i oppstartsfasen",
        summary: "Skal avvises",
        status: "draft",
        widgetIds: [
          "33333333-3333-4333-8333-333333333333",
          "44444444-4444-4444-8444-444444444444",
        ],
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
          field: "status",
          message: "Ukjent felt",
        },
      ],
    });
    expect(dependencies.createCluster).not.toHaveBeenCalled();
  });

  it("POST creates a cluster with URL projectId as the authoritative value", async () => {
    const dependencies = createDependencies();
    const { handleCreateCluster } = await import("./route");
    const { logInfo } = await import("@/lib/logger");
    const logInfoMock = vi.mocked(logInfo);

    const response = await handleCreateCluster(
      createPostRequest({
        name: "Behov i oppstartsfasen",
        summary: "Samler widgets om samme tema",
        widgetIds: [
          "33333333-3333-4333-8333-333333333333",
          "44444444-4444-4444-8444-444444444444",
        ],
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(201);
    expect(dependencies.createCluster).toHaveBeenCalledWith(
      {
        projectId,
        name: "Behov i oppstartsfasen",
        summary: "Samler widgets om samme tema",
        status: "draft",
        widgetIds: [
          "33333333-3333-4333-8333-333333333333",
          "44444444-4444-4444-8444-444444444444",
        ],
      },
      expect.objectContaining({
        callId: "call-123",
      }),
    );
    await expect(response.json()).resolves.toEqual({
      clusterId: "22222222-2222-4222-8222-222222222222",
      callId: "call-123",
    });
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain(
      "Samler widgets om samme tema",
    );
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("summary");
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("textContent");
    expect(JSON.stringify(logInfoMock.mock.calls)).not.toContain("metadata");
  });

  it("POST returns 422 when widgets do not belong to the project", async () => {
    const dependencies = createDependencies();
    const { ClusterWidgetsProjectMismatchError } = await import(
      "@/lib/cluster-service"
    );
    dependencies.createCluster.mockRejectedValue(
      new ClusterWidgetsProjectMismatchError(),
    );
    const { handleCreateCluster } = await import("./route");

    const response = await handleCreateCluster(
      createPostRequest({
        name: "Behov i oppstartsfasen",
        summary: "Samler widgets om samme tema",
        widgetIds: [
          "33333333-3333-4333-8333-333333333333",
          "44444444-4444-4444-8444-444444444444",
        ],
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
          message: "Alle widgets i klyngen må tilhøre prosjektet.",
        },
      ],
    });
  });

  it("POST returns 409 on duplicate cluster memberships", async () => {
    const dependencies = createDependencies();
    const { DuplicateClusterMembershipError } = await import(
      "@/lib/cluster-service"
    );
    dependencies.createCluster.mockRejectedValue(
      new DuplicateClusterMembershipError(),
    );
    const { handleCreateCluster } = await import("./route");

    const response = await handleCreateCluster(
      createPostRequest({
        name: "Behov i oppstartsfasen",
        summary: "Samler widgets om samme tema",
        widgetIds: [
          "33333333-3333-4333-8333-333333333333",
          "44444444-4444-4444-8444-444444444444",
        ],
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "Samme widget kan ikke legges inn flere ganger i samme klynge.",
      callId: "call-123",
    });
  });

  it("POST returns 500 and logs sanitized metadata when creation fails", async () => {
    const dependencies = createDependencies();
    dependencies.createCluster.mockRejectedValue(new Error("database offline"));
    const { handleCreateCluster } = await import("./route");
    const { logError } = await import("@/lib/logger");
    const logErrorMock = vi.mocked(logError);

    const response = await handleCreateCluster(
      createPostRequest({
        name: "Behov i oppstartsfasen",
        summary: "Samler widgets om samme tema",
        widgetIds: [
          "33333333-3333-4333-8333-333333333333",
          "44444444-4444-4444-8444-444444444444",
        ],
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(500);
    expect(logErrorMock).toHaveBeenCalledWith("Failed to create cluster", {
      callId: "call-123",
      path: `/api/projects/${projectId}/clusters`,
      method: "POST",
      projectId,
      error: "database offline",
    });
    expect(JSON.stringify(logErrorMock.mock.calls)).not.toContain(
      "Behov i oppstartsfasen",
    );
    expect(JSON.stringify(logErrorMock.mock.calls)).not.toContain(
      "Samler widgets om samme tema",
    );
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
