import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { classifications, projects, widgets } from "@/db/schema";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateClassifyBody, validateUuid } from "@/lib/classify-validation";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { isUniqueViolation } from "@/lib/postgres-error";

export const dynamic = "force-dynamic";

export const PUT = withProtectedApiRoute(async (request, context) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  // Path: /api/projects/[id]/widgets/[widgetId]/classify
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Ugyldig JSON i forespørsel", callId: context.callId },
      { status: 400 },
    );
  }

  const validation = validateClassifyBody(body);
  if (!validation.ok) {
    return Response.json(
      {
        message: "Ugyldig forespørsel",
        errors: validation.errors,
        callId: context.callId,
      },
      { status: 400 },
    );
  }

  const data = validation.data;

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

    // Verify widget exists and belongs to this project
    const [widget] = await db
      .select({ id: widgets.id, version: widgets.version })
      .from(widgets)
      .where(and(eq(widgets.id, widgetId), eq(widgets.projectId, projectId)))
      .limit(1);

    if (!widget) {
      return Response.json(
        {
          message: "Widgeten finnes ikke i dette prosjektet",
          callId: context.callId,
        },
        { status: 404 },
      );
    }

    // Check for existing classification
    const [existing] = await db
      .select({
        id: classifications.id,
        version: classifications.version,
      })
      .from(classifications)
      .where(eq(classifications.widgetId, widgetId))
      .limit(1);

    // Blocker 2: Create-race — explicit state mismatch detection
    if (data.expectedState === "unclassified" && existing) {
      logWarn("Create-race: classification already exists", {
        callId: context.callId,
        widgetId,
        existingVersion: existing.version,
      });

      return Response.json(
        {
          message:
            "Denne widgeten er allerede klassifisert av noen andre. Last inn på nytt.",
          callId: context.callId,
        },
        { status: 409 },
      );
    }

    if (data.expectedState === "classified" && !existing) {
      logWarn("Update attempted but no classification exists", {
        callId: context.callId,
        widgetId,
      });

      return Response.json(
        {
          message: "Klassifiseringen finnes ikke lenger. Last inn på nytt.",
          callId: context.callId,
        },
        { status: 409 },
      );
    }

    if (existing) {
      // Update: check optimistic concurrency
      if (existing.version !== data.version) {
        logWarn("Classification version conflict", {
          callId: context.callId,
          widgetId,
          expectedVersion: data.version,
          actualVersion: existing.version,
        });

        return Response.json(
          {
            message:
              "Denne klassifiseringen er endret av noen andre. Last inn på nytt før du lagrer.",
            callId: context.callId,
          },
          { status: 409 },
        );
      }

      const newVersion = existing.version + 1;

      // Blocker 1: Check actual affected rows via returning()
      const updated = await db
        .update(classifications)
        .set({
          laneTypeKey: data.laneTypeKey,
          laneTypeLabel: data.laneTypeLabel,
          scenario: data.scenario ?? null,
          actorTrack: data.actorTrack ?? null,
          journeyStep: data.journeyStep ?? null,
          journeyIndex: data.journeyIndex ?? null,
          notes: data.notes ?? null,
          version: newVersion,
          updatedBy: context.user.navIdent,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(classifications.id, existing.id),
            eq(classifications.version, existing.version),
          ),
        )
        .returning({ id: classifications.id });

      if (updated.length === 0) {
        logWarn("Concurrent update: 0 rows affected", {
          callId: context.callId,
          widgetId,
          classificationId: existing.id,
          attemptedVersion: data.version,
        });

        return Response.json(
          {
            message:
              "Denne klassifiseringen er endret av noen andre. Last inn på nytt før du lagrer.",
            callId: context.callId,
          },
          { status: 409 },
        );
      }

      logInfo("Classification updated", {
        callId: context.callId,
        widgetId,
        classificationId: existing.id,
        version: newVersion,
      });

      return Response.json(
        {
          classificationId: existing.id,
          version: newVersion,
          callId: context.callId,
        },
        { status: 200 },
      );
    }

    // Create new classification — version in request must be 1
    if (data.version !== 1) {
      return Response.json(
        {
          message:
            "Denne klassifiseringen er endret av noen andre. Last inn på nytt før du lagrer.",
          callId: context.callId,
        },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(classifications)
      .values({
        projectId,
        widgetId,
        laneTypeKey: data.laneTypeKey,
        laneTypeLabel: data.laneTypeLabel,
        scenario: data.scenario ?? null,
        actorTrack: data.actorTrack ?? null,
        journeyStep: data.journeyStep ?? null,
        journeyIndex: data.journeyIndex ?? null,
        notes: data.notes ?? null,
        status: "draft",
        version: 1,
        createdBy: context.user.navIdent,
        updatedBy: context.user.navIdent,
      })
      .returning({ id: classifications.id, version: classifications.version });

    logInfo("Classification created", {
      callId: context.callId,
      widgetId,
      classificationId: created.id,
    });

    return Response.json(
      {
        classificationId: created.id,
        version: created.version,
        callId: context.callId,
      },
      { status: 201 },
    );
  } catch (error) {
    // Unique constraint violation on classifications.widgetId (concurrent insert race)
    if (isUniqueViolation(error)) {
      logWarn("Create-race: unique violation on classification insert", {
        callId: context.callId,
        widgetId,
      });

      return Response.json(
        {
          message:
            "Denne widgeten er allerede klassifisert av noen andre. Last inn på nytt.",
          callId: context.callId,
        },
        { status: 409 },
      );
    }

    logError("Failed to save classification", {
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
