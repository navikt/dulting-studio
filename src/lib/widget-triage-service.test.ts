import { describe, expect, it, vi } from "vitest";
import type { ProtectedApiContext } from "./auth";
import {
  setWidgetTriage,
  type WidgetTriageStore,
  WidgetTriageWidgetsProjectMismatchError,
} from "./widget-triage-service";
import type { WidgetTriageRequestBody } from "./widget-triage-validation";

const context: ProtectedApiContext = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

const projectId = "11111111-1111-4111-8111-111111111111";
const payload: WidgetTriageRequestBody = {
  widgetIds: [
    "22222222-2222-4222-8222-222222222222",
    "33333333-3333-4333-8333-333333333333",
  ],
  state: "parked",
  reason: "Må vurderes senere.",
};

describe("setWidgetTriage", () => {
  it("sets triage state for project widgets", async () => {
    const store: WidgetTriageStore = {
      findWidgetsByIds: vi.fn().mockResolvedValue(payload.widgetIds),
      setWidgetTriage: vi.fn().mockResolvedValue(undefined),
    };

    await expect(
      setWidgetTriage(store, projectId, payload, context),
    ).resolves.toEqual({
      widgetIds: payload.widgetIds,
      state: "parked",
    });

    expect(store.setWidgetTriage).toHaveBeenCalledWith({
      projectId,
      widgetIds: payload.widgetIds,
      state: "parked",
      reason: "Må vurderes senere.",
      updatedBy: "Z123456",
    });
  });

  it("rejects widgets outside the project", async () => {
    const store: WidgetTriageStore = {
      findWidgetsByIds: vi.fn().mockResolvedValue([payload.widgetIds[0]]),
      setWidgetTriage: vi.fn(),
    };

    await expect(
      setWidgetTriage(store, projectId, payload, context),
    ).rejects.toBeInstanceOf(WidgetTriageWidgetsProjectMismatchError);

    expect(store.setWidgetTriage).not.toHaveBeenCalled();
  });
});
