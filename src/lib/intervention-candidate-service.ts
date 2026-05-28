import { and, eq, inArray } from "drizzle-orm";
import type { getDb } from "@/db/client";
import {
  interventionCandidates,
  interventionCandidateSources,
  type NewInterventionCandidate,
  type NewInterventionCandidateSource,
  widgets,
} from "@/db/schema";
import type { ProtectedApiContext } from "./auth";
import type { CreateInterventionCandidateInput } from "./intervention-candidate-validation";
import { isUniqueViolation } from "./postgres-error";

type Database = ReturnType<typeof getDb>;

export class InterventionCandidateWidgetsProjectMismatchError extends Error {
  readonly code = "intervention_candidate_widgets_project_mismatch";

  constructor() {
    super("Alle widgets i tiltakskandidaten må tilhøre prosjektet.");
  }
}

export class DuplicateInterventionCandidateSourceError extends Error {
  readonly code = "duplicate_intervention_candidate_source";

  constructor() {
    super("Samme widget kan ikke legges inn flere ganger i samme tiltak.");
  }
}

export type InterventionCandidateStore = {
  findWidgetsByIds(
    projectId: string,
    widgetIds: string[],
  ): Promise<Array<{ id: string; muralWidgetId: string }>>;
  insertInterventionCandidate(input: {
    candidate: NewInterventionCandidate;
    sources: Pick<
      NewInterventionCandidateSource,
      "widgetId" | "muralWidgetId" | "piiRisk"
    >[];
  }): Promise<{ candidateId: string }>;
};

export type CreateInterventionCandidateResult = {
  candidateId: string;
};

export async function createInterventionCandidate(
  store: InterventionCandidateStore,
  payload: CreateInterventionCandidateInput,
  context: ProtectedApiContext,
): Promise<CreateInterventionCandidateResult> {
  const uniqueWidgetIds = [...new Set(payload.widgetIds)];

  if (uniqueWidgetIds.length !== payload.widgetIds.length) {
    throw new DuplicateInterventionCandidateSourceError();
  }

  const matchingWidgets = await store.findWidgetsByIds(
    payload.projectId,
    uniqueWidgetIds,
  );

  if (matchingWidgets.length !== uniqueWidgetIds.length) {
    throw new InterventionCandidateWidgetsProjectMismatchError();
  }

  const now = new Date();
  const candidate: NewInterventionCandidate = {
    projectId: payload.projectId,
    title: payload.title,
    status: payload.status,
    desiredBehavior: payload.desiredBehavior,
    rationale: payload.rationale,
    actorTrack: payload.actorTrack,
    journeyStep: payload.journeyStep,
    placementRole: payload.placementRole,
    piiConfirmedBy: context.user.navIdent,
    piiConfirmedAt: now,
    createdBy: context.user.navIdent,
    updatedBy: context.user.navIdent,
  };

  const widgetById = new Map(
    matchingWidgets.map((widget) => [widget.id, widget]),
  );
  const sources: Pick<
    NewInterventionCandidateSource,
    "widgetId" | "muralWidgetId" | "piiRisk"
  >[] = uniqueWidgetIds.map((widgetId) => {
    const widget = widgetById.get(widgetId);

    if (!widget) {
      throw new InterventionCandidateWidgetsProjectMismatchError();
    }

    return {
      widgetId,
      muralWidgetId: widget.muralWidgetId,
      piiRisk: "none",
    };
  });

  try {
    return await store.insertInterventionCandidate({
      candidate,
      sources,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateInterventionCandidateSourceError();
    }

    throw error;
  }
}

export function createDrizzleInterventionCandidateStore(
  db: Database,
): InterventionCandidateStore {
  return {
    async findWidgetsByIds(projectId, widgetIds) {
      if (widgetIds.length === 0) {
        return [];
      }

      return db
        .select({
          id: widgets.id,
          muralWidgetId: widgets.muralWidgetId,
        })
        .from(widgets)
        .where(
          and(eq(widgets.projectId, projectId), inArray(widgets.id, widgetIds)),
        );
    },

    async insertInterventionCandidate(input) {
      return db.transaction(async (tx) => {
        const [insertedCandidate] = await tx
          .insert(interventionCandidates)
          .values(input.candidate)
          .returning({ id: interventionCandidates.id });

        await tx.insert(interventionCandidateSources).values(
          input.sources.map((source) => ({
            ...source,
            candidateId: insertedCandidate.id,
          })),
        );

        return {
          candidateId: insertedCandidate.id,
        };
      });
    },
  };
}
