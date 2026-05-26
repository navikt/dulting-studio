import { getDb } from "@/db/client";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { logError, logInfo, logWarn } from "@/lib/logger";
import {
  type ProjectImportRequest,
  ProjectImportValidationError,
  validateProjectImportRequest,
} from "@/lib/mural-import-contract";
import {
  createDrizzleProjectImportStore,
  createProjectImport,
  DuplicateProjectImportError,
  type ProjectImportResult,
} from "@/lib/mural-import-service";

export const dynamic = "force-dynamic";

type ProjectImportHandlerDependencies = {
  createProjectImport: (
    payload: ProjectImportRequest,
    context: ProtectedApiContext,
  ) => Promise<ProjectImportResult>;
};

const defaultDependencies: ProjectImportHandlerDependencies = {
  createProjectImport(payload, context) {
    const db = getDb();
    const store = createDrizzleProjectImportStore(db);
    return createProjectImport(store, payload, context);
  },
};

function createErrorResponse(
  callId: string,
  message: string,
  status: number,
  issues?: string[],
) {
  return Response.json(
    {
      message,
      callId,
      ...(issues ? { issues } : {}),
    },
    { status },
  );
}

export async function handleProjectImport(
  request: Request,
  context: ProtectedApiContext,
  dependencies: ProjectImportHandlerDependencies = defaultDependencies,
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logWarn("Rejected invalid import JSON", {
      callId: context.callId,
      path: "/api/projects/import",
      method: request.method,
    });

    return createErrorResponse(
      context.callId,
      "Request body must be valid JSON",
      400,
    );
  }

  let payload: ProjectImportRequest;

  try {
    payload = validateProjectImportRequest(body);
  } catch (error) {
    if (error instanceof ProjectImportValidationError) {
      logWarn("Rejected invalid mural import payload", {
        callId: context.callId,
        path: "/api/projects/import",
        method: request.method,
      });

      return createErrorResponse(
        context.callId,
        "Invalid import payload",
        400,
        error.issues,
      );
    }

    throw error;
  }

  logInfo("Processing mural import", {
    callId: context.callId,
    path: "/api/projects/import",
    method: request.method,
    totalWidgets: payload.report.totalWidgets,
    includedWidgets: payload.report.includedWidgets,
    droppedWidgets: payload.report.droppedWidgets,
    unknownTypeCount: payload.report.unknownTypeCount,
    missingTextCount: payload.report.missingTextCount,
    geometryWarningCount: payload.report.geometryWarningCount,
  });

  try {
    const result = await dependencies.createProjectImport(payload, context);

    logInfo("Completed mural import", {
      callId: context.callId,
      path: "/api/projects/import",
      method: request.method,
      totalWidgets: result.report.totalWidgets,
      includedWidgets: result.report.includedWidgets,
      droppedWidgets: result.report.droppedWidgets,
    });

    return Response.json(
      {
        ...result,
        callId: context.callId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DuplicateProjectImportError) {
      logWarn("Rejected mural reimport", {
        callId: context.callId,
        path: "/api/projects/import",
        method: request.method,
      });

      return createErrorResponse(context.callId, error.message, 409);
    }

    logError("Failed mural import", {
      callId: context.callId,
      path: "/api/projects/import",
      method: request.method,
    });

    return createErrorResponse(context.callId, "Internal server error", 500);
  }
}

export const POST = withProtectedApiRoute((request, context) =>
  handleProjectImport(request, context),
);
