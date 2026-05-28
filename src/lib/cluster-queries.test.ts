import { describe, expect, it, vi } from "vitest";
import {
  type ClusterQueryStore,
  getClusterWithWidgets,
  listClusters,
} from "./cluster-queries";

const projectId = "11111111-1111-4111-8111-111111111111";
const clusterId = "22222222-2222-4222-8222-222222222222";
const otherClusterId = "44444444-4444-4444-8444-444444444444";

function createStore(
  overrides: Partial<ClusterQueryStore> = {},
): ClusterQueryStore {
  return {
    fetchClusterRows: vi.fn().mockResolvedValue([]),
    fetchClusterMembershipRows: vi.fn().mockResolvedValue([]),
    fetchCluster: vi.fn().mockResolvedValue(null),
    fetchClusterWidgetRows: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("listClusters", () => {
  it("returns cluster summaries with widget counts", async () => {
    const createdAt = new Date("2024-09-01T10:00:00.000Z");
    const updatedAt = new Date("2024-09-02T11:00:00.000Z");
    const store = createStore({
      fetchClusterRows: vi.fn().mockResolvedValue([
        {
          id: clusterId,
          name: "Behov i oppstartsfasen",
          summary: "Skal ikke med i listevisning",
          status: "draft",
          createdAt,
          updatedAt,
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          name: "Innsikter om trygghet",
          summary: null,
          status: "validated",
          createdAt,
          updatedAt,
        },
      ]),
      fetchClusterMembershipRows: vi
        .fn()
        .mockResolvedValue([
          { clusterId },
          { clusterId },
          { clusterId: "33333333-3333-4333-8333-333333333333" },
        ]),
    });

    await expect(listClusters(store, projectId)).resolves.toEqual([
      {
        id: clusterId,
        name: "Behov i oppstartsfasen",
        status: "draft",
        widgetCount: 2,
        createdAt,
        updatedAt,
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Innsikter om trygghet",
        status: "validated",
        widgetCount: 1,
        createdAt,
        updatedAt,
      },
    ]);
    expect(store.fetchClusterRows).toHaveBeenCalledWith(projectId);
    expect(store.fetchClusterMembershipRows).toHaveBeenCalledWith([
      clusterId,
      "33333333-3333-4333-8333-333333333333",
    ]);
  });

  it("returns zero widgetCount when a cluster has no memberships", async () => {
    const createdAt = new Date("2024-09-01T10:00:00.000Z");
    const updatedAt = new Date("2024-09-02T11:00:00.000Z");
    const store = createStore({
      fetchClusterRows: vi.fn().mockResolvedValue([
        {
          id: clusterId,
          name: "Tom klynge",
          summary: null,
          status: "draft",
          createdAt,
          updatedAt,
        },
      ]),
    });

    await expect(listClusters(store, projectId)).resolves.toEqual([
      {
        id: clusterId,
        name: "Tom klynge",
        status: "draft",
        widgetCount: 0,
        createdAt,
        updatedAt,
      },
    ]);
  });
});

describe("getClusterWithWidgets", () => {
  it("returns null when the cluster does not belong to the project", async () => {
    const store = createStore({
      fetchCluster: vi.fn().mockResolvedValue(null),
    });

    await expect(
      getClusterWithWidgets(store, projectId, clusterId),
    ).resolves.toBeNull();
    expect(store.fetchCluster).toHaveBeenCalledWith(projectId, clusterId);
    expect(store.fetchClusterWidgetRows).not.toHaveBeenCalled();
  });

  it("does not return cross-project data for a cluster lookup", async () => {
    const store = createStore({
      fetchCluster: vi.fn().mockResolvedValue(null),
      fetchClusterWidgetRows: vi.fn().mockResolvedValue([
        {
          id: "55555555-5555-4555-8555-555555555555",
          muralWidgetId: "foreign-widget",
          widgetType: "text",
          textContent: "Skal ikke lekkes på tvers av prosjekt",
        },
      ]),
    });

    await expect(
      getClusterWithWidgets(store, projectId, otherClusterId),
    ).resolves.toBeNull();
    expect(store.fetchCluster).toHaveBeenCalledWith(projectId, otherClusterId);
    expect(store.fetchClusterWidgetRows).not.toHaveBeenCalled();
  });

  it("returns minimized widget references with truncated plain text", async () => {
    const createdAt = new Date("2024-09-01T10:00:00.000Z");
    const updatedAt = new Date("2024-09-02T11:00:00.000Z");
    const longText = `${"a".repeat(205)} full tekst`;
    const store = createStore({
      fetchCluster: vi.fn().mockResolvedValue({
        id: clusterId,
        name: "Behov i oppstartsfasen",
        summary: "Samler relaterte widgets",
        status: "draft",
        createdAt,
        updatedAt,
      }),
      fetchClusterWidgetRows: vi.fn().mockResolvedValue([
        {
          id: "44444444-4444-4444-8444-444444444444",
          muralWidgetId: "mural-widget-1",
          widgetType: "text",
          textContent: `<p>${longText}</p>`,
        },
      ]),
    });

    await expect(
      getClusterWithWidgets(store, projectId, clusterId),
    ).resolves.toEqual({
      id: clusterId,
      name: "Behov i oppstartsfasen",
      summary: "Samler relaterte widgets",
      status: "draft",
      createdAt,
      updatedAt,
      widgets: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          muralWidgetId: "mural-widget-1",
          widgetType: "text",
          textContent: `${"a".repeat(200)}…`,
        },
      ],
    });
    expect(store.fetchClusterWidgetRows).toHaveBeenCalledWith(
      projectId,
      clusterId,
    );
  });
});
