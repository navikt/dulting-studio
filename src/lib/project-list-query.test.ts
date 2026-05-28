import { describe, expect, it, vi } from "vitest";
import {
  listProjects,
  type ProjectListProjectRecord,
  type ProjectListStore,
  parseProjectListQueryParams,
} from "./project-list-query";

function createStore(projects: ProjectListProjectRecord[]): ProjectListStore {
  return {
    fetchProjects: vi.fn().mockResolvedValue(projects),
  };
}

function createProject(
  overrides: Partial<ProjectListProjectRecord> &
    Pick<ProjectListProjectRecord, "id" | "name">,
): ProjectListProjectRecord {
  return {
    sourceSystem: "mural",
    deletedAt: null,
    imports: [],
    widgets: [],
    ...overrides,
  };
}

describe("parseProjectListQueryParams", () => {
  it("uses importedAt desc as default sort", () => {
    expect(parseProjectListQueryParams(new URLSearchParams())).toEqual({
      ok: true,
      params: {
        sort: "importedAt",
        order: "desc",
      },
    });
  });

  it("rejects invalid sort and order values", () => {
    expect(
      parseProjectListQueryParams(
        new URLSearchParams({
          sort: "createdAt",
          order: "down",
        }),
      ),
    ).toEqual({
      ok: false,
      errors: [
        {
          field: "sort",
          message: "Må være en av: name, importedAt, widgetCount",
        },
        {
          field: "order",
          message: "Må være 'asc' eller 'desc'",
        },
      ],
    });
  });
});

describe("listProjects", () => {
  it("returns an empty list when no imported mural projects exist", async () => {
    await expect(
      listProjects(createStore([]), { sort: "importedAt", order: "desc" }),
    ).resolves.toEqual([]);
  });

  it("returns project summaries for completed imports", async () => {
    const store = createStore([
      createProject({
        id: "project-1",
        name: "Oppfølgingsplan",
        imports: [
          {
            id: "import-1",
            status: "completed",
            sourceDescription: "Workshop august",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: null,
          },
        ],
        widgets: [
          {
            importId: "import-1",
            muralWidgetId: "widget-1",
          },
          {
            importId: "import-1",
            muralWidgetId: "widget-2",
          },
        ],
      }),
    ]);

    await expect(
      listProjects(store, { sort: "importedAt", order: "desc" }),
    ).resolves.toEqual([
      {
        id: "project-1",
        name: "Oppfølgingsplan",
        sourceDescription: "Workshop august",
        importedAt: new Date("2024-08-15T08:35:00.000Z"),
        latestImportStatus: "completed",
        widgetCount: 2,
      },
    ]);
  });

  it("deduplicates widget count across multiple active imports for the same project", async () => {
    const store = createStore([
      createProject({
        id: "project-1",
        name: "Oppfølgingsplan",
        imports: [
          {
            id: "import-1",
            status: "completed",
            sourceDescription: "Workshop august",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: null,
          },
          {
            id: "import-2",
            status: "processing",
            sourceDescription: "Workshop september",
            createdAt: new Date("2024-09-01T10:00:00.000Z"),
            completedAt: null,
            deletedAt: null,
          },
          {
            id: "import-deleted",
            status: "completed",
            sourceDescription: "Utgått import",
            createdAt: new Date("2024-09-10T10:00:00.000Z"),
            completedAt: new Date("2024-09-10T10:05:00.000Z"),
            deletedAt: new Date("2024-09-11T10:00:00.000Z"),
          },
        ],
        widgets: [
          {
            importId: "import-1",
            muralWidgetId: "widget-1",
          },
          {
            importId: "import-1",
            muralWidgetId: "widget-2",
          },
          {
            importId: "import-2",
            muralWidgetId: "widget-1",
          },
          {
            importId: "import-2",
            muralWidgetId: "widget-3",
          },
          {
            importId: "import-deleted",
            muralWidgetId: "widget-4",
          },
        ],
      }),
    ]);

    await expect(
      listProjects(store, { sort: "widgetCount", order: "desc" }),
    ).resolves.toEqual([
      {
        id: "project-1",
        name: "Oppfølgingsplan",
        sourceDescription: "Workshop september",
        importedAt: new Date("2024-08-15T08:35:00.000Z"),
        latestImportStatus: "processing",
        widgetCount: 3,
      },
    ]);
  });

  it("keeps importedAt null when the project only has failed or pending imports", async () => {
    const store = createStore([
      createProject({
        id: "project-1",
        name: "Uavklart import",
        imports: [
          {
            id: "import-1",
            status: "failed",
            sourceDescription: "Workshop august",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: null,
            deletedAt: null,
          },
          {
            id: "import-2",
            status: "pending",
            sourceDescription: "Workshop september",
            createdAt: new Date("2024-09-01T10:00:00.000Z"),
            completedAt: null,
            deletedAt: null,
          },
        ],
        widgets: [
          {
            importId: "import-2",
            muralWidgetId: "widget-1",
          },
        ],
      }),
    ]);

    await expect(
      listProjects(store, { sort: "importedAt", order: "desc" }),
    ).resolves.toEqual([
      {
        id: "project-1",
        name: "Uavklart import",
        sourceDescription: "Workshop september",
        importedAt: null,
        latestImportStatus: "pending",
        widgetCount: 1,
      },
    ]);
  });

  it("keeps importedAt null values last even when sorting ascending", async () => {
    const store = createStore([
      createProject({
        id: "project-1",
        name: "Tidlig import",
        imports: [
          {
            id: "import-1",
            status: "completed",
            sourceDescription: "Workshop august",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: null,
          },
        ],
      }),
      createProject({
        id: "project-2",
        name: "Sen import",
        imports: [
          {
            id: "import-2",
            status: "completed",
            sourceDescription: "Workshop september",
            createdAt: new Date("2024-09-01T10:00:00.000Z"),
            completedAt: new Date("2024-09-01T10:05:00.000Z"),
            deletedAt: null,
          },
        ],
      }),
      createProject({
        id: "project-3",
        name: "Pågående import",
        imports: [
          {
            id: "import-3",
            status: "processing",
            sourceDescription: "Workshop oktober",
            createdAt: new Date("2024-10-01T10:00:00.000Z"),
            completedAt: null,
            deletedAt: null,
          },
        ],
      }),
    ]);

    await expect(
      listProjects(store, { sort: "importedAt", order: "asc" }),
    ).resolves.toMatchObject([
      { id: "project-1", importedAt: new Date("2024-08-15T08:35:00.000Z") },
      { id: "project-2", importedAt: new Date("2024-09-01T10:05:00.000Z") },
      { id: "project-3", importedAt: null },
    ]);
  });

  it("tolerates unknown import statuses by returning null status instead of failing the list", async () => {
    const store = createStore([
      createProject({
        id: "project-1",
        name: "Ukjent status",
        imports: [
          {
            id: "import-1",
            status: null,
            sourceDescription: "Workshop august",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: null,
            deletedAt: null,
          },
        ],
        widgets: [{ importId: "import-1", muralWidgetId: "widget-1" }],
      }),
    ]);

    await expect(
      listProjects(store, { sort: "importedAt", order: "desc" }),
    ).resolves.toEqual([
      {
        id: "project-1",
        name: "Ukjent status",
        sourceDescription: "Workshop august",
        importedAt: null,
        latestImportStatus: null,
        widgetCount: 1,
      },
    ]);
  });

  it("filters out deleted, non-mural, and never-imported projects", async () => {
    const store = createStore([
      createProject({
        id: "project-1",
        name: "Synlig prosjekt",
        imports: [
          {
            id: "import-1",
            status: "completed",
            sourceDescription: "Workshop",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: null,
          },
        ],
      }),
      createProject({
        id: "project-2",
        name: "Slettet prosjekt",
        deletedAt: new Date("2024-08-16T08:00:00.000Z"),
        imports: [
          {
            id: "import-2",
            status: "completed",
            sourceDescription: "Workshop",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: null,
          },
        ],
      }),
      createProject({
        id: "project-3",
        name: "Annet system",
        sourceSystem: "manual",
        imports: [
          {
            id: "import-3",
            status: "completed",
            sourceDescription: "Workshop",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: null,
          },
        ],
      }),
      createProject({
        id: "project-4",
        name: "Ingen aktive importer",
        imports: [
          {
            id: "import-4",
            status: "completed",
            sourceDescription: "Utgått",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: new Date("2024-08-16T08:00:00.000Z"),
          },
        ],
      }),
      createProject({
        id: "project-5",
        name: "Aldri importert",
      }),
    ]);

    await expect(
      listProjects(store, { sort: "name", order: "asc" }),
    ).resolves.toEqual([
      {
        id: "project-1",
        name: "Synlig prosjekt",
        sourceDescription: "Workshop",
        importedAt: new Date("2024-08-15T08:35:00.000Z"),
        latestImportStatus: "completed",
        widgetCount: 0,
      },
    ]);
  });

  it("sorts stably by importedAt and widgetCount", async () => {
    const store = createStore([
      createProject({
        id: "project-b",
        name: "Beta",
        imports: [
          {
            id: "import-b",
            status: "completed",
            sourceDescription: "Import B",
            createdAt: new Date("2024-08-15T08:30:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: null,
          },
        ],
        widgets: [{ importId: "import-b", muralWidgetId: "widget-1" }],
      }),
      createProject({
        id: "project-a",
        name: "Alfa",
        imports: [
          {
            id: "import-a",
            status: "completed",
            sourceDescription: "Import A",
            createdAt: new Date("2024-08-15T08:20:00.000Z"),
            completedAt: new Date("2024-08-15T08:35:00.000Z"),
            deletedAt: null,
          },
        ],
        widgets: [{ importId: "import-a", muralWidgetId: "widget-2" }],
      }),
      createProject({
        id: "project-c",
        name: "Gamma",
        imports: [
          {
            id: "import-c",
            status: "pending",
            sourceDescription: "Import C",
            createdAt: new Date("2024-08-16T08:20:00.000Z"),
            completedAt: null,
            deletedAt: null,
          },
        ],
        widgets: [
          { importId: "import-c", muralWidgetId: "widget-3" },
          { importId: "import-c", muralWidgetId: "widget-4" },
        ],
      }),
    ]);

    await expect(
      listProjects(store, { sort: "importedAt", order: "desc" }),
    ).resolves.toMatchObject([
      { id: "project-a", name: "Alfa" },
      { id: "project-b", name: "Beta" },
      { id: "project-c", name: "Gamma" },
    ]);

    await expect(
      listProjects(store, { sort: "widgetCount", order: "asc" }),
    ).resolves.toMatchObject([
      { id: "project-a", name: "Alfa", widgetCount: 1 },
      { id: "project-b", name: "Beta", widgetCount: 1 },
      { id: "project-c", name: "Gamma", widgetCount: 2 },
    ]);
  });
});
