import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProtectedApiContext } from "@/lib/auth";
import type { CurrentInterventionPackage } from "@/lib/intervention-package-queries";

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

const projectId = "11111111-1111-4111-8111-111111111111";
const packageId = "22222222-2222-4222-8222-222222222222";
const context: ProtectedApiContext = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

const packageDetail: CurrentInterventionPackage = {
  package: {
    id: packageId,
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

function createRequest(body: unknown) {
  return new Request(
    `https://example.com/api/projects/${projectId}/intervention-packages/current/export`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

function createDependencies() {
  return {
    findActiveProject: vi.fn().mockResolvedValue({ id: projectId }),
    getCurrentPackageWithCandidates: vi.fn().mockResolvedValue(packageDetail),
    buildInterventionPackageExport: vi.fn().mockReturnValue({
      content: "# Tiltakspakke: Tiltakspakke 1\n",
      contentType: "text/markdown; charset=utf-8",
      fileName: `tiltakspakke-${packageId}-2026-05-28.md`,
      contentHash: "a".repeat(64),
      includedPiiRiskLevels: ["none"],
    }),
    recordPackageExport: vi.fn().mockResolvedValue({ exportId: "export-1" }),
    now: vi.fn().mockReturnValue(new Date("2026-05-28T12:30:00.000Z")),
  };
}

describe("/api/projects/[id]/intervention-packages/current/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST exports markdown after PII confirmation and records audit event", async () => {
    const dependencies = createDependencies();
    const { handleExportCurrentPackage } = await import("./route");

    const response = await handleExportCurrentPackage(
      createRequest({ format: "markdown", piiExportConfirmed: true }),
      context,
      dependencies,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("Content-Disposition")).toContain(
      `tiltakspakke-${packageId}-2026-05-28.md`,
    );
    expect(dependencies.recordPackageExport).toHaveBeenCalledWith(
      packageId,
      {
        format: "markdown",
        contentHash: "a".repeat(64),
        includedPiiRiskLevels: ["none"],
      },
      expect.objectContaining({ callId: "call-123" }),
    );
    await expect(response.text()).resolves.toBe(
      "# Tiltakspakke: Tiltakspakke 1\n",
    );
  });

  it("POST rejects export without PII confirmation", async () => {
    const dependencies = createDependencies();
    const { handleExportCurrentPackage } = await import("./route");

    const response = await handleExportCurrentPackage(
      createRequest({ format: "markdown", piiExportConfirmed: false }),
      context,
      dependencies,
    );

    expect(response.status).toBe(400);
    expect(dependencies.recordPackageExport).not.toHaveBeenCalled();
  });
});
