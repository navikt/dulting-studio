import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateUuid } from "@/lib/classify-validation";
import { logError, logInfo, logWarn } from "@/lib/logger";
import {
  createDrizzleWidgetTriageStore,
  setWidgetTriage,
  WidgetTriageWidgetsProjectMismatchError,
} from "@/lib/widget-triage-service";
import {
  validateWidgetTriageBody,
  type WidgetTriageRequestBody,
  type WidgetTriageValidationError,
} from "@/lib/widget-triage-validation";

export const dynamic = "force-dynamic";

type WidgetTriageRouteDependencies = {
  findActiveProject(projectId: string): Promise<{ id: string } | null>;
  setWidgetTriage(
    projectId: string,
    payload: WidgetTriageRequestBody,
    context: ProtectedApiContext,
  ): Promise<{ widgetIds: string[]; state: string }>;
};

const defaultDependencies: WidgetTriageRouteDependencies = {
  async findActiveProject(projectId) {
    const db = getDb();
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    return project ?? null;
  },

  setWidgetTriage(projectId, payload, context) {
    const db = getDb();
    const store = createDrizzleWidgetTriageStore(db);
    return setWidgetTriage(store, projectId, payload, context);
  },
};

function createErrorResponse(
  callId: string,
  message: string,
  status: number,
  errors?: WidgetTriageValidationError[],
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

function getPath(projectId: string) {
  return `/api/projects/${projectId}/widgets/triage`;
}

export async function handleSetWidgetTriage(
  request: Request,
  context: ProtectedApiContext,
  dependencies: WidgetTriageRouteDependencies = defaultDependencies,
) {
  const projectId = getProjectIdFromRequest(request);
  const path = getPath(projectId ?? "unknown");

  if (!validateUuid(projectId)) {
    return createErrorResponse(context.callId, "Ugyldig prosjekt-id", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logWarn("Rejected invalid widget triage JSON", {
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

  const validation = validateWidgetTriageBody(body);
  if (!validation.ok) {
    logWarn("Rejected invalid widget triage payload", {
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

    const result = await dependencies.setWidgetTriage(
      projectId,
      validation.data,
      context,
    );

    logInfo("Updated widget triage", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      state: result.state,
      widgetCount: result.widgetIds.length,
    });

    return Response.json({
      widgetIds: result.widgetIds,
      state: result.state,
      callId: context.callId,
    });
  } catch (error) {
    if (error instanceof WidgetTriageWidgetsProjectMismatchError) {
      logWarn("Rejected widget triage due to validation error", {
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

    logError("Failed to update widget triage", {
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
  handleSetWidgetTriage(request, context),
);
