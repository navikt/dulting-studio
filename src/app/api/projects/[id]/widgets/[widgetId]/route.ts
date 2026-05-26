import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { classifications, projects, widgets } from "@/db/schema";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateUuid } from "@/lib/classify-validation";
import { logError, logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/[id]/widgets/[widgetId]
 * Returns full widget detail including untruncated textContent (stripped of HTML).
 */
export const GET = withProtectedApiRoute(async (request, context) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const projectId = pathParts[3];
  const widgetId = pathParts[5];

  if (!validateUuid(projectId)) {
    return Response.json(
      { message: "Ugyldig prosjekt-id", callId: context.callId },
      { status: 400 },
    );
  }

  if (!validateUuid(widgetId)) {
    return Response.json(
      { message: "Ugyldig widget-id", callId: context.callId },
      { status: 400 },
    );
  }

  try {
    const db = getDb();

    // Verify project exists
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    if (!project) {
      return Response.json(
        { message: "Prosjektet finnes ikke", callId: context.callId },
        { status: 404 },
      );
    }

    // Fetch widget with classification
    const [row] = await db
      .select({
        id: widgets.id,
        muralWidgetId: widgets.muralWidgetId,
        widgetType: widgets.widgetType,
        textContent: widgets.textContent,
        backgroundColor: widgets.backgroundColor,
        rowIndex: widgets.rowIndex,
        columnIndex: widgets.columnIndex,
        rowId: widgets.rowId,
        columnId: widgets.columnId,
        x: widgets.x,
        y: widgets.y,
        width: widgets.width,
        height: widgets.height,
        createdAt: widgets.createdAt,
        classificationId: classifications.id,
        laneTypeKey: classifications.laneTypeKey,
        laneTypeLabel: classifications.laneTypeLabel,
        classificationVersion: classifications.version,
        classificationScenario: classifications.scenario,
        classificationActorTrack: classifications.actorTrack,
        classificationJourneyStep: classifications.journeyStep,
        classificationJourneyIndex: classifications.journeyIndex,
        classificationNotes: classifications.notes,
        classificationStatus: classifications.status,
      })
      .from(widgets)
      .leftJoin(classifications, eq(widgets.id, classifications.widgetId))
      .where(and(eq(widgets.id, widgetId), eq(widgets.projectId, projectId)))
      .limit(1);

    if (!row) {
      return Response.json(
        {
          message: "Widgeten finnes ikke i dette prosjektet",
          callId: context.callId,
        },
        { status: 404 },
      );
    }

    // Strip HTML from textContent — never expose raw HTML to frontend
    const plainText = row.textContent.replace(/<[^>]*>/g, "").trim();

    logInfo("Served widget detail", {
      callId: context.callId,
      projectId,
      widgetId,
    });

    return Response.json({
      id: row.id,
      widgetType: row.widgetType,
      textContent: plainText,
      backgroundColor: row.backgroundColor,
      rowIndex: row.rowIndex,
      columnIndex: row.columnIndex,
      position: { x: row.x, y: row.y, width: row.width, height: row.height },
      classification: row.classificationId
        ? {
            id: row.classificationId,
            laneTypeKey: row.laneTypeKey,
            laneTypeLabel: row.laneTypeLabel,
            version: row.classificationVersion,
            scenario: row.classificationScenario,
            actorTrack: row.classificationActorTrack,
            journeyStep: row.classificationJourneyStep,
            journeyIndex: row.classificationJourneyIndex,
            notes: row.classificationNotes,
            status: row.classificationStatus,
          }
        : null,
      createdAt: row.createdAt,
      callId: context.callId,
    });
  } catch (error) {
    logError("Failed to fetch widget detail", {
      callId: context.callId,
      widgetId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return Response.json(
      { message: "Intern serverfeil", callId: context.callId },
      { status: 500 },
    );
  }
});
