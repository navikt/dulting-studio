import { eq, inArray } from "drizzle-orm";
import type { getDb } from "@/db/client";
import {
  interventionCandidateSources,
  interventionCandidates,
} from "@/db/schema";

type Database = ReturnType<typeof getDb>;

export type InterventionCandidateListItem = {
  id: string;
  title: string;
  status: string;
  rationale: string;
  actorTrack: string | null;
  journeyStep: string | null;
  placementRole: string | null;
  widgetCount: number;
  sourceRefs: InterventionCandidateSourceRef[];
  createdAt: Date;
  updatedAt: Date;
};

export type InterventionCandidateSourceRef = {
  widgetId: string;
  muralWidgetId: string;
  piiRisk: string;
};

type InterventionCandidateRow = Omit<
  InterventionCandidateListItem,
  "widgetCount" | "sourceRefs"
>;

type InterventionCandidateSourceRow = InterventionCandidateSourceRef & {
  candidateId: string;
};

export type InterventionCandidateQueryStore = {
  fetchCandidateRows(projectId: string): Promise<InterventionCandidateRow[]>;
  fetchSourceRows(
    candidateIds: string[],
  ): Promise<InterventionCandidateSourceRow[]>;
};

export async function listInterventionCandidates(
  store: InterventionCandidateQueryStore,
  projectId: string,
): Promise<InterventionCandidateListItem[]> {
  const candidateRows = await store.fetchCandidateRows(projectId);

  if (candidateRows.length === 0) {
    return [];
  }

  const sourceRows = await store.fetchSourceRows(
    candidateRows.map((candidate) => candidate.id),
  );
  const sourceRefsByCandidateId = new Map<
    string,
    InterventionCandidateSourceRef[]
  >();

  for (const source of sourceRows) {
    const sourceRefs = sourceRefsByCandidateId.get(source.candidateId) ?? [];
    sourceRefs.push({
      widgetId: source.widgetId,
      muralWidgetId: source.muralWidgetId,
      piiRisk: source.piiRisk,
    });
    sourceRefsByCandidateId.set(source.candidateId, sourceRefs);
  }

  return candidateRows.map((candidate) => {
    const sourceRefs = sourceRefsByCandidateId.get(candidate.id) ?? [];

    return {
      ...candidate,
      widgetCount: sourceRefs.length,
      sourceRefs,
    };
  });
}

export function createDrizzleInterventionCandidateQueryStore(
  db: Database,
): InterventionCandidateQueryStore {
  return {
    fetchCandidateRows(projectId) {
      return db
        .select({
          id: interventionCandidates.id,
          title: interventionCandidates.title,
          status: interventionCandidates.status,
          rationale: interventionCandidates.rationale,
          actorTrack: interventionCandidates.actorTrack,
          journeyStep: interventionCandidates.journeyStep,
          placementRole: interventionCandidates.placementRole,
          createdAt: interventionCandidates.createdAt,
          updatedAt: interventionCandidates.updatedAt,
        })
        .from(interventionCandidates)
        .where(eq(interventionCandidates.projectId, projectId))
        .orderBy(
          interventionCandidates.updatedAt,
          interventionCandidates.createdAt,
          interventionCandidates.id,
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
        })
        .from(interventionCandidateSources)
        .where(inArray(interventionCandidateSources.candidateId, candidateIds))
        .orderBy(interventionCandidateSources.createdAt);
    },
  };
}
