import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateUuid } from "@/lib/classify-validation";
import {
  createDrizzleInterventionCandidateQueryStore,
  type InterventionCandidateListItem,
  listInterventionCandidates,
} from "@/lib/intervention-candidate-queries";
import {
  type CreateInterventionCandidateResult,
  createDrizzleInterventionCandidateStore,
  createInterventionCandidate,
  DuplicateInterventionCandidateSourceError,
  InterventionCandidateWidgetsProjectMismatchError,
} from "@/lib/intervention-candidate-service";
import {
  type CreateInterventionCandidateInput,
  type InterventionCandidateValidationError,
  validateCreateInterventionCandidateBody,
} from "@/lib/intervention-candidate-validation";
import { logError, logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";

type InterventionCandidateCollectionRouteDependencies = {
  findActiveProject(projectId: string): Promise<{ id: string } | null>;
  listInterventionCandidates(
    projectId: string,
  ): Promise<InterventionCandidateListItem[]>;
  createInterventionCandidate(
    payload: CreateInterventionCandidateInput,
    context: ProtectedApiContext,
  ): Promise<CreateInterventionCandidateResult>;
};

const defaultDependencies: InterventionCandidateCollectionRouteDependencies = {
  async findActiveProject(projectId) {
    const db = getDb();
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    return project ?? null;
  },

  listInterventionCandidates(projectId) {
    const db = getDb();
    const store = createDrizzleInterventionCandidateQueryStore(db);
    return listInterventionCandidates(store, projectId);
  },

  createInterventionCandidate(payload, context) {
    const db = getDb();
    const store = createDrizzleInterventionCandidateStore(db);
    return createInterventionCandidate(store, payload, context);
  },
};

function createErrorResponse(
  callId: string,
  message: string,
  status: number,
  errors?: InterventionCandidateValidationError[],
) {
  return Response.json(
    {
      message,
      callId,
      ...(errors ? { errors } : {}),
    },
    { status },
  );
}

function getProjectIdFromRequest(request: Request) {
  return new URL(request.url).pathname.split("/")[3];
}

function getCollectionPath(projectId: string) {
  return `/api/projects/${projectId}/intervention-candidates`;
}

export async function handleGetInterventionCandidates(
  request: Request,
  context: ProtectedApiContext,
  dependencies: InterventionCandidateCollectionRouteDependencies = defaultDependencies,
) {
  const projectId = getProjectIdFromRequest(request);
  const path = getCollectionPath(projectId ?? "unknown");

  if (!validateUuid(projectId)) {
    return createErrorResponse(context.callId, "Ugyldig prosjekt-id", 400);
  }

  try {
    const project = await dependencies.findActiveProject(projectId);

    if (!project) {
      return createErrorResponse(context.callId, "Prosjektet finnes ikke", 404);
    }

    const candidates = await dependencies.listInterventionCandidates(projectId);

    logInfo("Served intervention candidate list", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      resultCount: candidates.length,
    });

    return Response.json({
      candidates,
      callId: context.callId,
    });
  } catch (error) {
    logError("Failed to fetch intervention candidate list", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return createErrorResponse(context.callId, "Intern serverfeil", 500);
  }
}

export async function handleCreateInterventionCandidate(
  request: Request,
  context: ProtectedApiContext,
  dependencies: InterventionCandidateCollectionRouteDependencies = defaultDependencies,
) {
  const projectId = getProjectIdFromRequest(request);
  const path = getCollectionPath(projectId ?? "unknown");

  if (!validateUuid(projectId)) {
    return createErrorResponse(context.callId, "Ugyldig prosjekt-id", 400);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logWarn("Rejected invalid intervention candidate JSON", {
      callId: context.callId,
      path,
      method: request.method,
    });

    return createErrorResponse(
      context.callId,
      "Ugyldig JSON i forespørsel",
      400,
    );
  }

  const validation = validateCreateInterventionCandidateBody(body);

  if (!validation.ok) {
    logWarn("Rejected invalid intervention candidate payload", {
      callId: context.callId,
      path,
      method: request.method,
    });

    return createErrorResponse(
      context.callId,
      "Ugyldig forespørsel",
      400,
      validation.errors,
    );
  }

  try {
    const project = await dependencies.findActiveProject(projectId);

    if (!project) {
      return createErrorResponse(context.callId, "Prosjektet finnes ikke", 404);
    }

    const payload: CreateInterventionCandidateInput = {
      ...validation.data,
      projectId,
      status: "proposed",
    };
    const result = await dependencies.createInterventionCandidate(
      payload,
      context,
    );

    logInfo("Created intervention candidate", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      candidateId: result.candidateId,
      widgetCount: payload.widgetIds.length,
      status: payload.status,
    });

    return Response.json(
      {
        candidateId: result.candidateId,
        callId: context.callId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof InterventionCandidateWidgetsProjectMismatchError) {
      logWarn("Rejected intervention candidate due to validation error", {
        callId: context.callId,
        path,
        method: request.method,
        projectId,
      });

      return createErrorResponse(context.callId, "Valideringsfeil", 422, [
        {
          field: "widgetIds",
          message: error.message,
        },
      ]);
    }

    if (error instanceof DuplicateInterventionCandidateSourceError) {
      logWarn("Rejected intervention candidate due to duplicate source", {
        callId: context.callId,
        path,
        method: request.method,
        projectId,
      });

      return createErrorResponse(context.callId, error.message, 409);
    }

    logError("Failed to create intervention candidate", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return createErrorResponse(context.callId, "Intern serverfeil", 500);
  }
}

export const GET = withProtectedApiRoute((request, context) =>
  handleGetInterventionCandidates(request, context),
);

export const POST = withProtectedApiRoute((request, context) =>
  handleCreateInterventionCandidate(request, context),
);
