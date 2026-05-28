import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProtectedApiContext } from "@/lib/auth";
import type { CurrentInterventionPackage } from "@/lib/intervention-package-queries";

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

const projectId = "11111111-1111-4111-8111-111111111111";
const context: ProtectedApiContext = {
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
    getCurrentPackageWithCandidates: vi.fn(),
  };
}

describe("/api/projects/[id]/intervention-packages/current", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns current package with grouped candidates and coverage", async () => {
    const packageDetail: CurrentInterventionPackage = {
      package: {
        id: "22222222-2222-4222-8222-222222222222",
        projectId,
        name: "Tiltakspakke 1",
        purpose: "Første kuraterte pakke.",
        status: "draft",
        createdAt: new Date("2026-05-28T10:00:00.000Z"),
        updatedAt: new Date("2026-05-28T11:00:00.000Z"),
      },
      groups: [],
      coverage: { actorTracks: [], journeySteps: [], cells: [] },
    };
    const dependencies = createDependencies();
    dependencies.getCurrentPackageWithCandidates.mockResolvedValue(packageDetail);
    const { handleGetCurrentPackage } = await import("./route");

    const response = await handleGetCurrentPackage(
      new Request(
        `https://example.com/api/projects/${projectId}/intervention-packages/current`,
      ),
      context,
      dependencies,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ...packageDetail,
      package: {
        ...packageDetail.package,
        createdAt: "2026-05-28T10:00:00.000Z",
        updatedAt: "2026-05-28T11:00:00.000Z",
      },
      callId: "call-123",
    });
  });

  it("GET returns 400 when projectId is invalid", async () => {
    const dependencies = createDependencies();
    const { handleGetCurrentPackage } = await import("./route");

    const response = await handleGetCurrentPackage(
      new Request(
        "https://example.com/api/projects/not-a-uuid/intervention-packages/current",
      ),
      context,
      dependencies,
    );

    expect(response.status).toBe(400);
    expect(dependencies.getCurrentPackageWithCandidates).not.toHaveBeenCalled();
  });
});
