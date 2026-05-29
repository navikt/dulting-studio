import { describe, expect, it, vi } from "vitest";
import type { ProtectedApiContext } from "./auth";
import {
  addCandidateToCurrentPackage,
  CandidateNotFoundForPackageError,
  DuplicatePackageMemberError,
  type InterventionPackageStore,
  RejectedCandidatePackageError,
  recordPackageExport,
} from "./intervention-package-service";
import type { AddPackageMemberInput } from "./intervention-package-validation";

const projectId = "11111111-1111-4111-8111-111111111111";
const packageId = "22222222-2222-4222-8222-222222222222";
const candidateId = "33333333-3333-4333-8333-333333333333";

const userContext: ProtectedApiContext = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

const payload: AddPackageMemberInput = {
  candidateId,
  assessment:
    "Relevant for første pakke fordi tiltaket kan gi tidligere oppfølging.",
  forgoodFlags: [
    {
      dimension: "goals",
      note: "Målet er tydelig koblet til tidligere dialog.",
    },
  ],
  openQuestions: [
    {
      question: "Må jurist se på ordlyden før test?",
      category: "juridisk",
    },
  ],
  stopCriteria: [
    {
      criterion: "Stopp hvis tiltaket gir flere fritekstsvar med PII.",
    },
  ],
  piiConfirmed: true,
};

describe("addCandidateToCurrentPackage", () => {
  it("creates Tiltakspakke 1 when missing and inserts package metadata", async () => {
    const store: InterventionPackageStore = {
      findCandidateForPackage: vi.fn().mockResolvedValue({
        id: candidateId,
        status: "proposed",
      }),
      findCurrentPackage: vi.fn().mockResolvedValue(null),
      insertCurrentPackage: vi.fn().mockResolvedValue({ packageId }),
      insertPackageMember: vi.fn().mockResolvedValue({ memberId: "member-1" }),
      insertPackageExport: vi.fn(),
      markPackageExported: vi.fn(),
    };

    const result = await addCandidateToCurrentPackage(
      store,
      projectId,
      payload,
      userContext,
    );

    expect(result).toEqual({ packageId, memberId: "member-1" });
    expect(store.insertCurrentPackage).toHaveBeenCalledWith({
      projectId,
      name: "Tiltakspakke 1",
      purpose:
        "Første kuraterte pakke med tiltakskandidater fra Mural-arbeidet.",
      status: "draft",
      createdBy: "Z123456",
      updatedBy: "Z123456",
    });
    expect(store.insertPackageMember).toHaveBeenCalledWith({
      packageId,
      candidateId,
      assessment: payload.assessment,
      forgoodFlags: payload.forgoodFlags,
      openQuestions: payload.openQuestions,
      stopCriteria: payload.stopCriteria,
      addedBy: "Z123456",
    });
  });

  it("reuses the current package when it already exists", async () => {
    const store: InterventionPackageStore = {
      findCandidateForPackage: vi.fn().mockResolvedValue({
        id: candidateId,
        status: "assessed_relevant",
      }),
      findCurrentPackage: vi.fn().mockResolvedValue({ id: packageId }),
      insertCurrentPackage: vi.fn(),
      insertPackageMember: vi.fn().mockResolvedValue({ memberId: "member-1" }),
      insertPackageExport: vi.fn(),
      markPackageExported: vi.fn(),
    };

    await addCandidateToCurrentPackage(store, projectId, payload, userContext);

    expect(store.insertCurrentPackage).not.toHaveBeenCalled();
    expect(store.insertPackageMember).toHaveBeenCalledWith(
      expect.objectContaining({ packageId, candidateId }),
    );
  });

  it("rejects candidates that do not belong to the project", async () => {
    const store: InterventionPackageStore = {
      findCandidateForPackage: vi.fn().mockResolvedValue(null),
      findCurrentPackage: vi.fn(),
      insertCurrentPackage: vi.fn(),
      insertPackageMember: vi.fn(),
      insertPackageExport: vi.fn(),
      markPackageExported: vi.fn(),
    };

    await expect(
      addCandidateToCurrentPackage(store, projectId, payload, userContext),
    ).rejects.toBeInstanceOf(CandidateNotFoundForPackageError);

    expect(store.insertPackageMember).not.toHaveBeenCalled();
  });

  it("rejects candidates that are already rejected", async () => {
    const store: InterventionPackageStore = {
      findCandidateForPackage: vi.fn().mockResolvedValue({
        id: candidateId,
        status: "rejected",
      }),
      findCurrentPackage: vi.fn(),
      insertCurrentPackage: vi.fn(),
      insertPackageMember: vi.fn(),
      insertPackageExport: vi.fn(),
      markPackageExported: vi.fn(),
    };

    await expect(
      addCandidateToCurrentPackage(store, projectId, payload, userContext),
    ).rejects.toBeInstanceOf(RejectedCandidatePackageError);

    expect(store.insertPackageMember).not.toHaveBeenCalled();
  });

  it("maps duplicate member inserts to a domain error", async () => {
    const store: InterventionPackageStore = {
      findCandidateForPackage: vi.fn().mockResolvedValue({
        id: candidateId,
        status: "proposed",
      }),
      findCurrentPackage: vi.fn().mockResolvedValue({ id: packageId }),
      insertCurrentPackage: vi.fn(),
      insertPackageMember: vi.fn().mockRejectedValue({
        code: "23505",
      }),
      insertPackageExport: vi.fn(),
      markPackageExported: vi.fn(),
    };

    await expect(
      addCandidateToCurrentPackage(store, projectId, payload, userContext),
    ).rejects.toBeInstanceOf(DuplicatePackageMemberError);
  });
});

describe("recordPackageExport", () => {
  it("records an append-only export event and marks the package exported", async () => {
    const store: InterventionPackageStore = {
      findCandidateForPackage: vi.fn(),
      findCurrentPackage: vi.fn(),
      insertCurrentPackage: vi.fn(),
      insertPackageMember: vi.fn(),
      insertPackageExport: vi.fn().mockResolvedValue({ exportId: "export-1" }),
      markPackageExported: vi.fn().mockResolvedValue(undefined),
    };

    await expect(
      recordPackageExport(
        store,
        packageId,
        {
          format: "markdown",
          contentHash: "a".repeat(64),
          includedPiiRiskLevels: ["none", "possible"],
        },
        userContext,
      ),
    ).resolves.toEqual({ exportId: "export-1" });

    expect(store.insertPackageExport).toHaveBeenCalledWith({
      packageId,
      format: "markdown",
      exportedBy: "Z123456",
      includedPiiRiskLevels: ["none", "possible"],
      contentHash: "a".repeat(64),
      callId: "call-123",
    });
    expect(store.markPackageExported).toHaveBeenCalledWith(
      packageId,
      "Z123456",
    );
  });
});
