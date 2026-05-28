import { describe, expect, it, vi } from "vitest";
import type { ProtectedApiContext } from "./auth";
import {
  type ClusterStore,
  ClusterWidgetsProjectMismatchError,
  createCluster,
  DuplicateClusterMembershipError,
  MinimumClusterWidgetCountError,
} from "./cluster-service";
import type { CreateClusterInput } from "./cluster-validation";

const userContext: ProtectedApiContext = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

const validPayload: CreateClusterInput = {
  projectId: "11111111-1111-4111-8111-111111111111",
  name: "Tema-klynge",
  summary: "Felles behov på tvers av widgets.",
  status: "draft",
  widgetIds: [
    "22222222-2222-4222-8222-222222222222",
    "33333333-3333-4333-8333-333333333333",
  ],
};

describe("createCluster", () => {
  it("creates a cluster with one membership per widget", async () => {
    const store: ClusterStore = {
      findWidgetsByIds: vi
        .fn()
        .mockResolvedValue(validPayload.widgetIds.map((id) => ({ id }))),
      insertCluster: vi.fn().mockResolvedValue({
        clusterId: "44444444-4444-4444-8444-444444444444",
      }),
    };

    const result = await createCluster(store, validPayload, userContext);

    expect(result).toEqual({
      clusterId: "44444444-4444-4444-8444-444444444444",
    });

    expect(store.insertCluster).toHaveBeenCalledWith({
      cluster: expect.objectContaining({
        projectId: validPayload.projectId,
        name: validPayload.name,
        summary: validPayload.summary,
        status: "draft",
        createdBy: "Z123456",
        updatedBy: "Z123456",
      }),
      memberships: [
        expect.objectContaining({
          widgetId: validPayload.widgetIds[0],
        }),
        expect.objectContaining({
          widgetId: validPayload.widgetIds[1],
        }),
      ],
    });
  });

  it("rejects clusters with fewer than two widgets", async () => {
    const store: ClusterStore = {
      findWidgetsByIds: vi.fn(),
      insertCluster: vi.fn(),
    };

    await expect(
      createCluster(
        store,
        { ...validPayload, widgetIds: [validPayload.widgetIds[0]] },
        userContext,
      ),
    ).rejects.toBeInstanceOf(MinimumClusterWidgetCountError);

    expect(store.findWidgetsByIds).not.toHaveBeenCalled();
    expect(store.insertCluster).not.toHaveBeenCalled();
  });

  it("rejects widgets that do not belong to the project", async () => {
    const store: ClusterStore = {
      findWidgetsByIds: vi
        .fn()
        .mockResolvedValue([{ id: validPayload.widgetIds[0] }]),
      insertCluster: vi.fn(),
    };

    await expect(
      createCluster(store, validPayload, userContext),
    ).rejects.toBeInstanceOf(ClusterWidgetsProjectMismatchError);

    expect(store.insertCluster).not.toHaveBeenCalled();
  });

  it("rejects duplicate memberships before insert", async () => {
    const store: ClusterStore = {
      findWidgetsByIds: vi.fn(),
      insertCluster: vi.fn(),
    };

    await expect(
      createCluster(
        store,
        {
          ...validPayload,
          widgetIds: [validPayload.widgetIds[0], validPayload.widgetIds[0]],
        },
        userContext,
      ),
    ).rejects.toBeInstanceOf(DuplicateClusterMembershipError);

    expect(store.findWidgetsByIds).not.toHaveBeenCalled();
    expect(store.insertCluster).not.toHaveBeenCalled();
  });
});
