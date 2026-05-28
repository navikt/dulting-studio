import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  withProtectedApiRoute: (handler: unknown) => handler,
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

describe("GET /api/projects", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns project list with default sorting", async () => {
    const listProjects = vi.fn().mockResolvedValue([
      {
        id: "project-1",
        name: "Oppfølgingsplan",
        sourceDescription: "Workshop august",
        importedAt: new Date("2024-08-15T08:35:00.000Z"),
        latestImportStatus: "completed",
        widgetCount: 2,
      },
    ]);
    const { handleGetProjects } = await import("./route");

    const response = await handleGetProjects(
      new Request("https://dulting-studio.intern.dev.nav.no/api/projects", {
        method: "GET",
      }),
      {
        callId: "call-123",
        user: {
          oid: "oid-1",
          navIdent: "Z123456",
          groups: [],
        },
      },
      { listProjects },
    );

    expect(response.status).toBe(200);
    expect(listProjects).toHaveBeenCalledWith({
      sort: "importedAt",
      order: "desc",
    });
    await expect(response.json()).resolves.toEqual({
      projects: [
        {
          id: "project-1",
          name: "Oppfølgingsplan",
          sourceDescription: "Workshop august",
          importedAt: "2024-08-15T08:35:00.000Z",
          latestImportStatus: "completed",
          widgetCount: 2,
        },
      ],
      sort: "importedAt",
      order: "desc",
    });
  });

  it("returns 400 for invalid sort parameter", async () => {
    const listProjects = vi.fn();
    const { handleGetProjects } = await import("./route");

    const response = await handleGetProjects(
      new Request(
        "https://dulting-studio.intern.dev.nav.no/api/projects?sort=createdAt",
        {
          method: "GET",
        },
      ),
      {
        callId: "call-124",
        user: {
          oid: "oid-1",
          navIdent: "Z123456",
          groups: [],
        },
      },
      { listProjects },
    );

    expect(response.status).toBe(400);
    expect(listProjects).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      message: "Ugyldige søkeparametre",
      errors: [
        {
          field: "sort",
          message: "Må være en av: name, importedAt, widgetCount",
        },
      ],
      callId: "call-124",
    });
  });

  it("returns 400 for invalid order parameter", async () => {
    const listProjects = vi.fn();
    const { handleGetProjects } = await import("./route");

    const response = await handleGetProjects(
      new Request(
        "https://dulting-studio.intern.dev.nav.no/api/projects?order=down",
        {
          method: "GET",
        },
      ),
      {
        callId: "call-125",
        user: {
          oid: "oid-1",
          navIdent: "Z123456",
          groups: [],
        },
      },
      { listProjects },
    );

    expect(response.status).toBe(400);
    expect(listProjects).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      message: "Ugyldige søkeparametre",
      errors: [
        {
          field: "order",
          message: "Må være 'asc' eller 'desc'",
        },
      ],
      callId: "call-125",
    });
  });

  it("returns 500 and logs sanitized error metadata when project lookup fails", async () => {
    const listProjects = vi
      .fn()
      .mockRejectedValue(new Error("database offline"));
    const { handleGetProjects } = await import("./route");
    const { logError } = await import("@/lib/logger");

    const response = await handleGetProjects(
      new Request("https://dulting-studio.intern.dev.nav.no/api/projects", {
        method: "GET",
      }),
      {
        callId: "call-126",
        user: {
          oid: "oid-1",
          navIdent: "Z123456",
          groups: [],
        },
      },
      { listProjects },
    );

    expect(response.status).toBe(500);
    expect(logError).toHaveBeenCalledWith("Failed to fetch project list", {
      callId: "call-126",
      path: "/api/projects",
      method: "GET",
      error: "database offline",
    });
    await expect(response.json()).resolves.toEqual({
      message: "Intern serverfeil",
      callId: "call-126",
    });
  });
});
