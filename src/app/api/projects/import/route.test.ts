import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectImportRequest } from "@/lib/mural-import-contract";

vi.mock("@/lib/auth", () => ({
  withProtectedApiRoute: (handler: unknown) => handler,
}));

const validPayload: ProjectImportRequest = {
  projectName: "Oppfølgingsplan Mural",
  projectDescription: "Sanitisert import for MVP",
  sourceId: "mural-board-123",
  sourceDescription: "Syntetisk Mural eksport",
  widgets: [
    {
      muralWidgetId: "widget-1",
      widgetType: "text",
      x: 12,
      y: 16,
      width: 120,
      height: 80,
      textContent: "Ren tekst",
      backgroundColor: "#FFF3CD",
      metadata: {},
    },
  ],
  report: {
    totalWidgets: 1,
    includedWidgets: 1,
    droppedWidgets: 0,
    unknownTypeCount: 0,
    missingTextCount: 0,
    geometryWarningCount: 0,
  },
};

describe("POST /api/projects/import", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("rejects forbidden top-level fields and metadata in direct API calls", async () => {
    const { handleProjectImport } = await import("./route");

    const response = await handleProjectImport(
      new Request(
        "https://dulting-studio.intern.dev.nav.no/api/projects/import",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            ...validPayload,
            owner: {
              id: "user-123",
            },
            widgets: [
              {
                ...validPayload.widgets[0],
                metadata: {
                  owner: {
                    id: "user-456",
                  },
                },
              },
            ],
          }),
        },
      ),
      {
        callId: "call-123",
        user: {
          oid: "oid-1",
          navIdent: "Z123456",
          groups: [],
        },
      },
      {
        createProjectImport: vi.fn(),
      },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      message: "Invalid import payload",
      callId: "call-123",
      issues: expect.arrayContaining([
        "payload.owner: feltet er forbudt i importkontrakten",
        "payload.widgets[0].metadata.owner: feltet er forbudt i importkontrakten",
      ]),
    });
  });

  it("rejects raw HTML in validated DTO fields", async () => {
    const { handleProjectImport } = await import("./route");

    const response = await handleProjectImport(
      new Request(
        "https://dulting-studio.intern.dev.nav.no/api/projects/import",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            ...validPayload,
            widgets: [
              {
                ...validPayload.widgets[0],
                textContent: "<p>Ulovlig HTML</p>",
                metadata: {
                  tableColumns: [
                    {
                      id: "column-1",
                      index: 0,
                      label: "<strong>Ikke lov</strong>",
                    },
                  ],
                },
              },
            ],
          }),
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
      {
        createProjectImport: vi.fn(),
      },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      message: "Invalid import payload",
      issues: expect.arrayContaining([
        "payload.widgets[0].textContent: må være ren tekst uten HTML",
        "payload.widgets[0].metadata.tableColumns[0].label: må være ren tekst uten HTML",
      ]),
    });
  });

  it("returns project and import ids for valid imports", async () => {
    const createProjectImport = vi.fn().mockResolvedValue({
      projectId: "project-1",
      importId: "import-1",
      report: validPayload.report,
    });
    const { handleProjectImport } = await import("./route");

    const response = await handleProjectImport(
      new Request(
        "https://dulting-studio.intern.dev.nav.no/api/projects/import",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(validPayload),
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
      {
        createProjectImport,
      },
    );

    expect(response.status).toBe(201);
    expect(createProjectImport).toHaveBeenCalledWith(
      validPayload,
      expect.objectContaining({
        callId: "call-125",
      }),
    );
    await expect(response.json()).resolves.toEqual({
      projectId: "project-1",
      importId: "import-1",
      report: validPayload.report,
      callId: "call-125",
    });
  });
});
