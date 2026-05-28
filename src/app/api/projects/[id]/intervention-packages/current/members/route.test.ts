import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProtectedApiContext } from "@/lib/auth";

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

const projectId = "11111111-1111-4111-8111-111111111111";
const candidateId = "22222222-2222-4222-8222-222222222222";
const context: ProtectedApiContext = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

function createRequest(body: unknown) {
  return new Request(
    `https://example.com/api/projects/${projectId}/intervention-packages/current/members`,
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
    addCandidateToCurrentPackage: vi.fn().mockResolvedValue({
      packageId: "33333333-3333-4333-8333-333333333333",
      memberId: "44444444-4444-4444-8444-444444444444",
    }),
  };
}

describe("/api/projects/[id]/intervention-packages/current/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST adds a candidate to Tiltakspakke 1 after PII confirmation", async () => {
    const dependencies = createDependencies();
    const { handleAddCurrentPackageMember } = await import("./route");

    const response = await handleAddCurrentPackageMember(
      createRequest({
        candidateId,
        assessment: "Relevant for første pakke.",
        forgoodFlags: [{ dimension: "goals", note: "Tydelig mål." }],
        openQuestions: [],
        stopCriteria: [],
        piiConfirmed: true,
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(201);
    expect(dependencies.addCandidateToCurrentPackage).toHaveBeenCalledWith(
      projectId,
      expect.objectContaining({
        candidateId,
        assessment: "Relevant for første pakke.",
      }),
      expect.objectContaining({ callId: "call-123" }),
    );
    await expect(response.json()).resolves.toEqual({
      packageId: "33333333-3333-4333-8333-333333333333",
      memberId: "44444444-4444-4444-8444-444444444444",
      callId: "call-123",
    });
  });

  it("POST rejects missing PII confirmation", async () => {
    const dependencies = createDependencies();
    const { handleAddCurrentPackageMember } = await import("./route");

    const response = await handleAddCurrentPackageMember(
      createRequest({
        candidateId,
        assessment: "Relevant for første pakke.",
        piiConfirmed: false,
      }),
      context,
      dependencies,
    );

    expect(response.status).toBe(400);
    expect(dependencies.addCandidateToCurrentPackage).not.toHaveBeenCalled();
  });
});
