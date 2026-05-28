import { and, eq, inArray } from "drizzle-orm";
import type { getDb } from "@/db/client";
import {
  interventionCandidates,
  interventionCandidateSources,
  interventionPackageMembers,
  interventionPackages,
  type PackageForgoodFlag,
  type PackageOpenQuestion,
  type PackageStopCriterion,
} from "@/db/schema";
import { CURRENT_PACKAGE_NAME } from "./intervention-package-service";

type Database = ReturnType<typeof getDb>;

const UNKNOWN_COVERAGE_VALUE = "Uplassert";

const PLACEMENT_ROLE_LABELS: Record<string, string> = {
  journey_step: "Reisesteg",
  cross_cutting_support: "Tverrgående støtte",
  package_support: "Pakkestøtte",
  clarification: "Avklaring",
  context: "Kontekst",
};

const PLACEMENT_ROLE_ORDER = [
  "journey_step",
  "cross_cutting_support",
  "package_support",
  "clarification",
  "context",
  "unknown",
];

export type InterventionPackageSummary = {
  id: string;
  projectId: string;
  name: string;
  purpose: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InterventionPackageCandidate = {
  id: string;
  memberId: string;
  title: string;
  status: string;
  desiredBehavior: string | null;
  rationale: string;
  actorTrack: string | null;
  journeyStep: string | null;
  placementRole: string | null;
  assessment: string;
  forgoodFlags: PackageForgoodFlag[];
  openQuestions: PackageOpenQuestion[];
  stopCriteria: PackageStopCriterion[];
  sourceRefs: InterventionPackageSourceRef[];
  addedAt: Date;
};

export type InterventionPackageSourceRef = {
  widgetId: string;
  muralWidgetId: string;
  piiRisk: string;
  sanitizedExcerpt: string | null;
  relevanceNote: string | null;
};

export type InterventionPackageGroup = {
  placementRole: string;
  label: string;
  candidates: InterventionPackageCandidate[];
};

export type InterventionPackageCoverage = {
  actorTracks: string[];
  journeySteps: string[];
  cells: Array<{
    actorTrack: string;
    journeyStep: string;
    count: number;
    candidateIds: string[];
  }>;
};

export type CurrentInterventionPackage = {
  package: InterventionPackageSummary | null;
  groups: InterventionPackageGroup[];
  coverage: InterventionPackageCoverage;
};

export type PackageMemberCandidateRow = Omit<
  InterventionPackageCandidate,
  "id" | "sourceRefs"
> & {
  candidateId: string;
};

export type PackageSourceRow = InterventionPackageSourceRef & {
  candidateId: string;
};

export type InterventionPackageQueryStore = {
  fetchCurrentPackage(
    projectId: string,
    name: string,
  ): Promise<InterventionPackageSummary | null>;
  fetchMemberCandidateRows(
    packageId: string,
  ): Promise<PackageMemberCandidateRow[]>;
  fetchSourceRows(candidateIds: string[]): Promise<PackageSourceRow[]>;
};

export async function getCurrentPackageWithCandidates(
  store: InterventionPackageQueryStore,
  projectId: string,
): Promise<CurrentInterventionPackage> {
  const currentPackage = await store.fetchCurrentPackage(
    projectId,
    CURRENT_PACKAGE_NAME,
  );

  if (!currentPackage) {
    return {
      package: null,
      groups: [],
      coverage: { actorTracks: [], journeySteps: [], cells: [] },
    };
  }

  const memberRows = await store.fetchMemberCandidateRows(currentPackage.id);
  const sourceRows = await store.fetchSourceRows(
    memberRows.map((member) => member.candidateId),
  );
  const sourceRefsByCandidateId = groupSourcesByCandidateId(sourceRows);
  const candidates = memberRows.map((row) => ({
    id: row.candidateId,
    memberId: row.memberId,
    title: row.title,
    status: row.status,
    desiredBehavior: row.desiredBehavior,
    rationale: row.rationale,
    actorTrack: row.actorTrack,
    journeyStep: row.journeyStep,
    placementRole: row.placementRole,
    assessment: row.assessment,
    forgoodFlags: row.forgoodFlags,
    openQuestions: row.openQuestions,
    stopCriteria: row.stopCriteria,
    sourceRefs: sourceRefsByCandidateId.get(row.candidateId) ?? [],
    addedAt: row.addedAt,
  }));

  return {
    package: currentPackage,
    groups: groupCandidatesByPlacementRole(candidates),
    coverage: buildCoverage(candidates),
  };
}

function groupSourcesByCandidateId(sourceRows: PackageSourceRow[]) {
  const sourceRefsByCandidateId = new Map<string, InterventionPackageSourceRef[]>();

  for (const source of sourceRows) {
    const refs = sourceRefsByCandidateId.get(source.candidateId) ?? [];
    refs.push({
      widgetId: source.widgetId,
      muralWidgetId: source.muralWidgetId,
      piiRisk: source.piiRisk,
      sanitizedExcerpt: source.sanitizedExcerpt,
      relevanceNote: source.relevanceNote,
    });
    sourceRefsByCandidateId.set(source.candidateId, refs);
  }

  return sourceRefsByCandidateId;
}

function groupCandidatesByPlacementRole(
  candidates: InterventionPackageCandidate[],
): InterventionPackageGroup[] {
  const groups = new Map<string, InterventionPackageCandidate[]>();

  for (const candidate of candidates) {
    const role = candidate.placementRole ?? "unknown";
    groups.set(role, [...(groups.get(role) ?? []), candidate]);
  }

  return [...groups.entries()]
    .sort(
      ([roleA], [roleB]) =>
        roleOrderIndex(roleA) - roleOrderIndex(roleB) ||
        roleA.localeCompare(roleB, "nb-NO"),
    )
    .map(([placementRole, candidates]) => ({
      placementRole,
      label: PLACEMENT_ROLE_LABELS[placementRole] ?? "Uplassert",
      candidates,
    }));
}

function buildCoverage(
  candidates: InterventionPackageCandidate[],
): InterventionPackageCoverage {
  const actorTracks: string[] = [];
  const journeySteps: string[] = [];
  const cellMap = new Map<string, InterventionPackageCoverage["cells"][number]>();

  for (const candidate of candidates) {
    const actorTrack = normalizeCoverageValue(candidate.actorTrack);
    const journeyStep = normalizeCoverageValue(candidate.journeyStep);

    if (!actorTracks.includes(actorTrack)) {
      actorTracks.push(actorTrack);
    }
    if (!journeySteps.includes(journeyStep)) {
      journeySteps.push(journeyStep);
    }

    const key = `${actorTrack}\u0000${journeyStep}`;
    const cell =
      cellMap.get(key) ??
      ({
        actorTrack,
        journeyStep,
        count: 0,
        candidateIds: [],
      } satisfies InterventionPackageCoverage["cells"][number]);
    cell.count += 1;
    cell.candidateIds.push(candidate.id);
    cellMap.set(key, cell);
  }

  return {
    actorTracks,
    journeySteps,
    cells: [...cellMap.values()],
  };
}

function normalizeCoverageValue(value: string | null) {
  const normalized = value?.trim();
  return normalized || UNKNOWN_COVERAGE_VALUE;
}

function roleOrderIndex(role: string) {
  const index = PLACEMENT_ROLE_ORDER.indexOf(role);
  return index === -1 ? PLACEMENT_ROLE_ORDER.length : index;
}

export function createDrizzleInterventionPackageQueryStore(
  db: Database,
): InterventionPackageQueryStore {
  return {
    async fetchCurrentPackage(projectId, name) {
      const [currentPackage] = await db
        .select({
          id: interventionPackages.id,
          projectId: interventionPackages.projectId,
          name: interventionPackages.name,
          purpose: interventionPackages.purpose,
          status: interventionPackages.status,
          createdAt: interventionPackages.createdAt,
          updatedAt: interventionPackages.updatedAt,
        })
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

    fetchMemberCandidateRows(packageId) {
      return db
        .select({
          memberId: interventionPackageMembers.id,
          candidateId: interventionCandidates.id,
          title: interventionCandidates.title,
          status: interventionCandidates.status,
          desiredBehavior: interventionCandidates.desiredBehavior,
          rationale: interventionCandidates.rationale,
          actorTrack: interventionCandidates.actorTrack,
          journeyStep: interventionCandidates.journeyStep,
          placementRole: interventionCandidates.placementRole,
          assessment: interventionPackageMembers.assessment,
          forgoodFlags: interventionPackageMembers.forgoodFlags,
          openQuestions: interventionPackageMembers.openQuestions,
          stopCriteria: interventionPackageMembers.stopCriteria,
          addedAt: interventionPackageMembers.createdAt,
        })
        .from(interventionPackageMembers)
        .innerJoin(
          interventionCandidates,
          eq(interventionPackageMembers.candidateId, interventionCandidates.id),
        )
        .where(eq(interventionPackageMembers.packageId, packageId))
        .orderBy(
          interventionPackageMembers.createdAt,
          interventionPackageMembers.id,
        );
    },

    fetchSourceRows(candidateIds) {
      if (candidateIds.length === 0) {
        return Promise.resolve([]);
      }

      return db
        .select({
          candidateId: interventionCandidateSources.candidateId,
          widgetId: interventionCandidateSources.widgetId,
          muralWidgetId: interventionCandidateSources.muralWidgetId,
          piiRisk: interventionCandidateSources.piiRisk,
          sanitizedExcerpt: interventionCandidateSources.sanitizedExcerpt,
          relevanceNote: interventionCandidateSources.relevanceNote,
        })
        .from(interventionCandidateSources)
        .where(inArray(interventionCandidateSources.candidateId, candidateIds))
        .orderBy(interventionCandidateSources.createdAt);
    },
  };
}
