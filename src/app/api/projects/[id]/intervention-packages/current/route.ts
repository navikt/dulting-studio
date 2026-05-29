import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateUuid } from "@/lib/classify-validation";
import {
  type CurrentInterventionPackage,
  createDrizzleInterventionPackageQueryStore,
  getCurrentPackageWithCandidates,
} from "@/lib/intervention-package-queries";
import { logError, logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";

type CurrentPackageRouteDependencies = {
  findActiveProject(projectId: string): Promise<{ id: string } | null>;
  getCurrentPackageWithCandidates(
    projectId: string,
  ): Promise<CurrentInterventionPackage>;
};

const defaultDependencies: CurrentPackageRouteDependencies = {
  async findActiveProject(projectId) {
    const db = getDb();
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    return project ?? null;
  },

  getCurrentPackageWithCandidates(projectId) {
    const db = getDb();
    const store = createDrizzleInterventionPackageQueryStore(db);
    return getCurrentPackageWithCandidates(store, projectId);
  },
};

function createErrorResponse(callId: string, message: string, status: number) {
  return Response.json({ message, callId }, { status });
}

function getProjectIdFromRequest(request: Request) {
  return new URL(request.url).pathname.split("/")[3];
}

export async function handleGetCurrentPackage(
  request: Request,
  context: ProtectedApiContext,
  dependencies: CurrentPackageRouteDependencies = defaultDependencies,
) {
  const projectId = getProjectIdFromRequest(request);
  const path = `/api/projects/${projectId ?? "unknown"}/intervention-packages/current`;

  if (!validateUuid(projectId)) {
    return createErrorResponse(context.callId, "Ugyldig prosjekt-id", 400);
  }

  try {
    const project = await dependencies.findActiveProject(projectId);

    if (!project) {
      return createErrorResponse(context.callId, "Prosjektet finnes ikke", 404);
    }

    const packageDetail =
      await dependencies.getCurrentPackageWithCandidates(projectId);

    logInfo("Served current intervention package", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      packageId: packageDetail.package?.id ?? null,
      groupCount: packageDetail.groups.length,
    });

    return Response.json({
      ...packageDetail,
      callId: context.callId,
    });
  } catch (error) {
    logError("Failed to fetch current intervention package", {
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
  handleGetCurrentPackage(request, context),
);
