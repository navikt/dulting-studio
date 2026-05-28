import { and, eq } from "drizzle-orm";
import type { getDb } from "@/db/client";
import {
  interventionCandidates,
  interventionPackageExports,
  interventionPackageMembers,
  interventionPackages,
  type NewInterventionPackage,
  type NewInterventionPackageExport,
  type NewInterventionPackageMember,
} from "@/db/schema";
import type { ProtectedApiContext } from "./auth";
import type { AddPackageMemberInput } from "./intervention-package-validation";
import { isUniqueViolation } from "./postgres-error";

type Database = ReturnType<typeof getDb>;

export const CURRENT_PACKAGE_NAME = "Tiltakspakke 1";
export const CURRENT_PACKAGE_PURPOSE =
  "Første kuraterte pakke med tiltakskandidater fra Mural-arbeidet.";

export class CandidateNotFoundForPackageError extends Error {
  readonly code = "candidate_not_found_for_package";

  constructor() {
    super("Tiltaket finnes ikke i prosjektet.");
  }
}

export class RejectedCandidatePackageError extends Error {
  readonly code = "rejected_candidate_package";

  constructor() {
    super("Forkastede tiltak kan ikke legges i tiltakspakken.");
  }
}

export class DuplicatePackageMemberError extends Error {
  readonly code = "duplicate_package_member";

  constructor() {
    super("Tiltaket ligger allerede i tiltakspakken.");
  }
}

export type InterventionPackageStore = {
  findCandidateForPackage(
    projectId: string,
    candidateId: string,
  ): Promise<{ id: string; status: string } | null>;
  findCurrentPackage(
    projectId: string,
    name: string,
  ): Promise<{ id: string } | null>;
  insertCurrentPackage(
    candidate: NewInterventionPackage,
  ): Promise<{ packageId: string }>;
  insertPackageMember(
    member: Pick<
      NewInterventionPackageMember,
      | "packageId"
      | "candidateId"
      | "assessment"
      | "forgoodFlags"
      | "openQuestions"
      | "stopCriteria"
      | "addedBy"
    >,
  ): Promise<{ memberId: string }>;
  insertPackageExport(
    packageExport: Pick<
      NewInterventionPackageExport,
      | "packageId"
      | "format"
      | "exportedBy"
      | "includedPiiRiskLevels"
      | "contentHash"
      | "callId"
    >,
  ): Promise<{ exportId: string }>;
  markPackageExported(packageId: string, updatedBy: string): Promise<void>;
};

export type AddPackageMemberResult = {
  packageId: string;
  memberId: string;
};

export type PackageExportAuditInput = {
  format: "markdown" | "json";
  contentHash: string;
  includedPiiRiskLevels: string[];
};

export async function addCandidateToCurrentPackage(
  store: InterventionPackageStore,
  projectId: string,
  payload: AddPackageMemberInput,
  context: ProtectedApiContext,
): Promise<AddPackageMemberResult> {
  const candidate = await store.findCandidateForPackage(
    projectId,
    payload.candidateId,
  );

  if (!candidate) {
    throw new CandidateNotFoundForPackageError();
  }

  if (candidate.status === "rejected") {
    throw new RejectedCandidatePackageError();
  }

  const currentPackage =
    (await store.findCurrentPackage(projectId, CURRENT_PACKAGE_NAME)) ??
    (await store.insertCurrentPackage({
      projectId,
      name: CURRENT_PACKAGE_NAME,
      purpose: CURRENT_PACKAGE_PURPOSE,
      status: "draft",
      createdBy: context.user.navIdent,
      updatedBy: context.user.navIdent,
    }));

  const packageId =
    "packageId" in currentPackage ? currentPackage.packageId : currentPackage.id;

  try {
    const member = await store.insertPackageMember({
      packageId,
      candidateId: payload.candidateId,
      assessment: payload.assessment,
      forgoodFlags: payload.forgoodFlags,
      openQuestions: payload.openQuestions,
      stopCriteria: payload.stopCriteria,
      addedBy: context.user.navIdent,
    });

    return {
      packageId,
      memberId: member.memberId,
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicatePackageMemberError();
    }

    throw error;
  }
}

export async function recordPackageExport(
  store: InterventionPackageStore,
  packageId: string,
  packageExport: PackageExportAuditInput,
  context: ProtectedApiContext,
) {
  const result = await store.insertPackageExport({
    packageId,
    format: packageExport.format,
    exportedBy: context.user.navIdent,
    includedPiiRiskLevels: packageExport.includedPiiRiskLevels,
    contentHash: packageExport.contentHash,
    callId: context.callId,
  });

  await store.markPackageExported(packageId, context.user.navIdent);

  return result;
}

export function createDrizzleInterventionPackageStore(
  db: Database,
): InterventionPackageStore {
  return {
    async findCandidateForPackage(projectId, candidateId) {
      const [candidate] = await db
        .select({
          id: interventionCandidates.id,
          status: interventionCandidates.status,
        })
        .from(interventionCandidates)
        .where(
          and(
            eq(interventionCandidates.projectId, projectId),
            eq(interventionCandidates.id, candidateId),
          ),
        )
        .limit(1);

      return candidate ?? null;
    },

    async findCurrentPackage(projectId, name) {
      const [currentPackage] = await db
        .select({ id: interventionPackages.id })
        .from(interventionPackages)
        .where(
          and(
            eq(interventionPackages.projectId, projectId),
            eq(interventionPackages.name, name),
          ),
        )
        .limit(1);

      return currentPackage ?? null;
    },

    async insertCurrentPackage(candidate) {
      try {
        const [insertedPackage] = await db
          .insert(interventionPackages)
          .values(candidate)
          .returning({ id: interventionPackages.id });

        return { packageId: insertedPackage.id };
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }

        const existingPackage = await this.findCurrentPackage(
          candidate.projectId,
          candidate.name,
        );

        if (!existingPackage) {
          throw error;
        }

        return { packageId: existingPackage.id };
      }
    },

    async insertPackageMember(member) {
      const [insertedMember] = await db
        .insert(interventionPackageMembers)
        .values(member)
        .returning({ id: interventionPackageMembers.id });

      return { memberId: insertedMember.id };
    },

    async insertPackageExport(packageExport) {
      const [insertedExport] = await db
        .insert(interventionPackageExports)
        .values(packageExport)
        .returning({ id: interventionPackageExports.id });

      return { exportId: insertedExport.id };
    },

    async markPackageExported(packageId, updatedBy) {
      await db
        .update(interventionPackages)
        .set({
          status: "exported",
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(interventionPackages.id, packageId));
    },
  };
}
