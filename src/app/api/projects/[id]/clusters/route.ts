import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateUuid } from "@/lib/classify-validation";
import {
  type ClusterListItem,
  createDrizzleClusterQueryStore,
  listClusters,
} from "@/lib/cluster-queries";
import {
  ClusterWidgetsProjectMismatchError,
  type CreateClusterResult,
  createCluster,
  createDrizzleClusterStore,
  DuplicateClusterMembershipError,
  MinimumClusterWidgetCountError,
} from "@/lib/cluster-service";
import {
  type ClusterValidationError,
  type CreateClusterInput,
  validateCreateClusterBody,
} from "@/lib/cluster-validation";
import { logError, logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";

type ClusterCollectionRouteDependencies = {
  findActiveProject(projectId: string): Promise<{ id: string } | null>;
  listClusters(projectId: string): Promise<ClusterListItem[]>;
  createCluster(
    payload: CreateClusterInput,
    context: ProtectedApiContext,
  ): Promise<CreateClusterResult>;
};

const defaultDependencies: ClusterCollectionRouteDependencies = {
  async findActiveProject(projectId) {
    const db = getDb();
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    return project ?? null;
  },

  listClusters(projectId) {
    const db = getDb();
    const store = createDrizzleClusterQueryStore(db);
    return listClusters(store, projectId);
  },

  createCluster(payload, context) {
    const db = getDb();
    const store = createDrizzleClusterStore(db);
    return createCluster(store, payload, context);
  },
};

function createErrorResponse(
  callId: string,
  message: string,
  status: number,
  errors?: ClusterValidationError[],
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
  return `/api/projects/${projectId}/clusters`;
}

export async function handleGetClusters(
  request: Request,
  context: ProtectedApiContext,
  dependencies: ClusterCollectionRouteDependencies = defaultDependencies,
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

    const clusters = await dependencies.listClusters(projectId);

    logInfo("Served cluster list", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      resultCount: clusters.length,
    });

    return Response.json({
      clusters,
      callId: context.callId,
    });
  } catch (error) {
    logError("Failed to fetch cluster list", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return createErrorResponse(context.callId, "Intern serverfeil", 500);
  }
}

export async function handleCreateCluster(
  request: Request,
  context: ProtectedApiContext,
  dependencies: ClusterCollectionRouteDependencies = defaultDependencies,
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
    logWarn("Rejected invalid cluster JSON", {
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

  const validation = validateCreateClusterBody(body);

  if (!validation.ok) {
    logWarn("Rejected invalid cluster payload", {
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

    const payload: CreateClusterInput = {
      ...validation.data,
      projectId,
      status: "draft",
    };
    const result = await dependencies.createCluster(payload, context);

    logInfo("Created cluster", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      clusterId: result.clusterId,
      widgetCount: payload.widgetIds.length,
      status: payload.status,
    });

    return Response.json(
      {
        clusterId: result.clusterId,
        callId: context.callId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof MinimumClusterWidgetCountError ||
      error instanceof ClusterWidgetsProjectMismatchError
    ) {
      logWarn("Rejected cluster creation due to validation error", {
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

    if (error instanceof DuplicateClusterMembershipError) {
      logWarn("Rejected cluster creation due to duplicate membership", {
        callId: context.callId,
        path,
        method: request.method,
        projectId,
      });

      return createErrorResponse(context.callId, error.message, 409);
    }

    logError("Failed to create cluster", {
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
  handleGetClusters(request, context),
);

export const POST = withProtectedApiRoute((request, context) =>
  handleCreateCluster(request, context),
);
