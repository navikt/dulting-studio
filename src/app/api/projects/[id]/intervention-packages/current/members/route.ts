import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateUuid } from "@/lib/classify-validation";
import {
  type AddPackageMemberResult,
  addCandidateToCurrentPackage,
  CandidateNotFoundForPackageError,
  createDrizzleInterventionPackageStore,
  DuplicatePackageMemberError,
  RejectedCandidatePackageError,
} from "@/lib/intervention-package-service";
import {
  type AddPackageMemberInput,
  type InterventionPackageValidationError,
  validateAddPackageMemberBody,
} from "@/lib/intervention-package-validation";
import { logError, logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";

type CurrentPackageMemberRouteDependencies = {
  findActiveProject(projectId: string): Promise<{ id: string } | null>;
  addCandidateToCurrentPackage(
    projectId: string,
    payload: AddPackageMemberInput,
    context: ProtectedApiContext,
  ): Promise<AddPackageMemberResult>;
};

const defaultDependencies: CurrentPackageMemberRouteDependencies = {
  async findActiveProject(projectId) {
    const db = getDb();
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    return project ?? null;
  },

  addCandidateToCurrentPackage(projectId, payload, context) {
    const db = getDb();
    const store = createDrizzleInterventionPackageStore(db);
    return addCandidateToCurrentPackage(store, projectId, payload, context);
  },
};

function createErrorResponse(
  callId: string,
  message: string,
  status: number,
  errors?: InterventionPackageValidationError[],
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

export async function handleAddCurrentPackageMember(
  request: Request,
  context: ProtectedApiContext,
  dependencies: CurrentPackageMemberRouteDependencies = defaultDependencies,
) {
  const projectId = getProjectIdFromRequest(request);
  const path = `/api/projects/${projectId ?? "unknown"}/intervention-packages/current/members`;

  if (!validateUuid(projectId)) {
    return createErrorResponse(context.callId, "Ugyldig prosjekt-id", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logWarn("Rejected invalid intervention package member JSON", {
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

  const validation = validateAddPackageMemberBody(body);
  if (!validation.ok) {
    logWarn("Rejected invalid intervention package member payload", {
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

    const result = await dependencies.addCandidateToCurrentPackage(
      projectId,
      validation.data,
      context,
    );

    logInfo("Added candidate to current intervention package", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      packageId: result.packageId,
      memberId: result.memberId,
    });

    return Response.json(
      {
        ...result,
        callId: context.callId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CandidateNotFoundForPackageError) {
      return createErrorResponse(context.callId, error.message, 404);
    }

    if (error instanceof RejectedCandidatePackageError) {
      return createErrorResponse(context.callId, error.message, 422);
    }

    if (error instanceof DuplicatePackageMemberError) {
      return createErrorResponse(context.callId, error.message, 409);
    }

    logError("Failed to add candidate to current intervention package", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return createErrorResponse(context.callId, "Intern serverfeil", 500);
  }
}

export const POST = withProtectedApiRoute((request, context) =>
  handleAddCurrentPackageMember(request, context),
);
