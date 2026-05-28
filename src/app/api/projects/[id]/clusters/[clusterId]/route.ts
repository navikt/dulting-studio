import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateUuid } from "@/lib/classify-validation";
import {
  type ClusterWithWidgets,
  createDrizzleClusterQueryStore,
  getClusterWithWidgets,
} from "@/lib/cluster-queries";
import { logError, logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";

type ClusterDetailRouteDependencies = {
  findActiveProject(projectId: string): Promise<{ id: string } | null>;
  getClusterWithWidgets(
    projectId: string,
    clusterId: string,
  ): Promise<ClusterWithWidgets | null>;
};

const defaultDependencies: ClusterDetailRouteDependencies = {
  async findActiveProject(projectId) {
    const db = getDb();
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    return project ?? null;
  },

  getClusterWithWidgets(projectId, clusterId) {
    const db = getDb();
    const store = createDrizzleClusterQueryStore(db);
    return getClusterWithWidgets(store, projectId, clusterId);
  },
};

function createErrorResponse(callId: string, message: string, status: number) {
  return Response.json(
    {
      message,
      callId,
    },
    { status },
  );
}

function getPathIds(request: Request) {
  const pathParts = new URL(request.url).pathname.split("/");

  return {
    projectId: pathParts[3],
    clusterId: pathParts[5],
  };
}

function getClusterDetailPath(projectId: string, clusterId: string) {
  return `/api/projects/${projectId}/clusters/${clusterId}`;
}

export async function handleGetCluster(
  request: Request,
  context: ProtectedApiContext,
  dependencies: ClusterDetailRouteDependencies = defaultDependencies,
) {
  const { projectId, clusterId } = getPathIds(request);

  if (!validateUuid(projectId)) {
    return createErrorResponse(context.callId, "Ugyldig prosjekt-id", 400);
  }

  if (!validateUuid(clusterId)) {
    return createErrorResponse(context.callId, "Ugyldig cluster-id", 400);
  }

  const path = getClusterDetailPath(projectId, clusterId);

  try {
    const project = await dependencies.findActiveProject(projectId);

    if (!project) {
      return createErrorResponse(context.callId, "Prosjektet finnes ikke", 404);
    }

    const cluster = await dependencies.getClusterWithWidgets(
      projectId,
      clusterId,
    );

    if (!cluster) {
      return createErrorResponse(
        context.callId,
        "Klyngen finnes ikke i dette prosjektet",
        404,
      );
    }

    logInfo("Served cluster detail", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      clusterId,
      widgetCount: cluster.widgets.length,
    });

    return Response.json({
      ...cluster,
      callId: context.callId,
    });
  } catch (error) {
    logError("Failed to fetch cluster detail", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      clusterId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return createErrorResponse(context.callId, "Intern serverfeil", 500);
  }
}

export const GET = withProtectedApiRoute((request, context) =>
  handleGetCluster(request, context),
);
