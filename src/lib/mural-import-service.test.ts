import { describe, expect, it, vi } from "vitest";
import type { ProjectImportRequest } from "./mural-import-contract";
import {
  createProjectImport,
  DuplicateProjectImportError,
  type ProjectImportStore,
} from "./mural-import-service";

const validPayload: ProjectImportRequest = {
  projectName: "Oppfølgingsplan Mural",
  projectDescription: "Sanitisert import for MVP",
  sourceId: "mural-board-123",
  sourceDescription: "Syntetisk Mural eksport",
  widgets: [
    {
      muralWidgetId: "table-1",
      widgetType: "table",
      x: 100,
      y: 120,
      width: 420,
      height: 220,
      textContent: "Tabell",
      metadata: {
        tableColumns: [{ id: "column-1", index: 0, label: "Fase" }],
        tableRows: [{ id: "row-1", index: 0, label: "Rad 1" }],
      },
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

const userContext = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

describe("createProjectImport", () => {
  it("rejects reimport of the same source in MVP", async () => {
    const store: ProjectImportStore = {
      findActiveProjectBySource: vi.fn().mockResolvedValue({ id: "project-1" }),
      insertProjectImport: vi.fn(),
    };

    await expect(
      createProjectImport(store, validPayload, userContext),
    ).rejects.toBeInstanceOf(DuplicateProjectImportError);

    expect(store.insertProjectImport).not.toHaveBeenCalled();
  });

  it("creates a new project import with minimized widgets", async () => {
    const store: ProjectImportStore = {
      findActiveProjectBySource: vi.fn().mockResolvedValue(null),
      insertProjectImport: vi.fn().mockResolvedValue({
        projectId: "project-1",
        importId: "import-1",
      }),
    };

    const result = await createProjectImport(store, validPayload, userContext);

    expect(result).toEqual({
      projectId: "project-1",
      importId: "import-1",
      report: validPayload.report,
    });

    expect(store.insertProjectImport).toHaveBeenCalledWith(
      expect.objectContaining({
        project: expect.objectContaining({
          name: "Oppfølgingsplan Mural",
          sourceSystem: "mural",
          sourceId: "mural-board-123",
          createdBy: "Z123456",
        }),
        muralImport: expect.objectContaining({
          sourceDescription: "Syntetisk Mural eksport",
          receivedWidgetCount: 1,
          storedWidgetCount: 1,
          skippedWidgetCount: 0,
          status: "completed",
        }),
        widgets: [
          expect.objectContaining({
            muralWidgetId: "table-1",
            widgetType: "table",
            textContent: "Tabell",
            metadata: {
              tableColumns: [{ id: "column-1", index: 0, label: "Fase" }],
              tableRows: [{ id: "row-1", index: 0, label: "Rad 1" }],
            },
          }),
        ],
      }),
    );
  });

  it("maps Drizzle-wrapped unique violations to duplicate import error", async () => {
    const pgError = new Error("duplicate key value violates unique constraint");
    (pgError as unknown as Record<string, unknown>).code = "23505";

    const drizzleWrappedError = new Error("Failed query");
    (drizzleWrappedError as unknown as Record<string, unknown>).cause = pgError;

    const store: ProjectImportStore = {
      findActiveProjectBySource: vi.fn().mockResolvedValue(null),
      insertProjectImport: vi.fn().mockRejectedValue(drizzleWrappedError),
    };

    await expect(
      createProjectImport(store, validPayload, userContext),
    ).rejects.toBeInstanceOf(DuplicateProjectImportError);
  });
});
