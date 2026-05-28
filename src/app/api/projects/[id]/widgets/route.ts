import { and, count, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  classifications,
  projects,
  type WidgetMetadata,
  widgets,
  widgetTriage,
} from "@/db/schema";
import { withProtectedApiRoute } from "@/lib/auth";
import { logError, logInfo } from "@/lib/logger";
import {
  computePagination,
  parseWidgetQueryParams,
  type WidgetQueryParams,
} from "@/lib/widget-query";

export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const GET = withProtectedApiRoute(async (request, context) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  // Path: /api/projects/[id]/widgets → id is at index 3
  const projectId = pathParts[3];

  if (!projectId || !UUID_REGEX.test(projectId)) {
    return Response.json(
      { message: "Ugyldig prosjekt-id", callId: context.callId },
      { status: 400 },
    );
  }

  const parseResult = parseWidgetQueryParams(url.searchParams);

  if (!parseResult.ok) {
    return Response.json(
      {
        message: "Ugyldige søkeparametre",
        errors: parseResult.errors,
        callId: context.callId,
      },
      { status: 400 },
    );
  }

  const params = parseResult.params;

  try {
    const db = getDb();

    // Verify project exists and is not deleted
    const [project] = await db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    if (!project) {
      return Response.json(
        { message: "Prosjektet finnes ikke", callId: context.callId },
        { status: 404 },
      );
    }

    // Build filter conditions
    const conditions = buildFilterConditions(projectId, params);

    // Count total matching
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(widgets)
      .leftJoin(classifications, eq(widgets.id, classifications.widgetId))
      .leftJoin(widgetTriage, eq(widgets.id, widgetTriage.widgetId))
      .where(and(...conditions));

    const total = totalCount ?? 0;
    const pagination = computePagination(params.page, params.pageSize, total);
    const offset = (params.page - 1) * params.pageSize;

    // Fetch page of widgets
    const items = await db
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
        classificationStatus: classifications.status,
        triageState: widgetTriage.state,
        triageReason: widgetTriage.reason,
      })
      .from(widgets)
      .leftJoin(classifications, eq(widgets.id, classifications.widgetId))
      .leftJoin(widgetTriage, eq(widgets.id, widgetTriage.widgetId))
      .where(and(...conditions))
      .orderBy(widgets.rowIndex, widgets.columnIndex, widgets.createdAt)
      .limit(params.pageSize)
      .offset(offset);

    const axisOptions = buildAxisOptions(
      await db
        .select({
          muralWidgetId: widgets.muralWidgetId,
          metadata: widgets.metadata,
        })
        .from(widgets)
        .where(
          and(
            eq(widgets.projectId, projectId),
            eq(widgets.widgetType, "table"),
          ),
        )
        .orderBy(widgets.createdAt),
    );
    const axisLookup = buildAxisLookup(axisOptions);

    logInfo("Served widget list", {
      callId: context.callId,
      projectId,
      page: params.page,
      pageSize: params.pageSize,
      total,
      resultCount: items.length,
    });

    return Response.json({
      items: items.map((item) => formatWidgetItem(item, axisLookup)),
      axisOptions,
      ...pagination,
      callId: context.callId,
    });
  } catch (error) {
    logError("Failed to fetch widgets", {
      callId: context.callId,
      projectId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return Response.json(
      { message: "Intern serverfeil", callId: context.callId },
      { status: 500 },
    );
  }
});

function buildFilterConditions(projectId: string, params: WidgetQueryParams) {
  const conditions = [eq(widgets.projectId, projectId)];

  if (params.type) {
    conditions.push(eq(widgets.widgetType, params.type));
  }

  if (params.search) {
    conditions.push(
      ilike(widgets.textContent, `%${escapeLike(params.search)}%`),
    );
  }

  if (params.status === "classified") {
    conditions.push(isNotNull(classifications.id));
  } else if (params.status === "unclassified") {
    conditions.push(isNull(classifications.id));
  }

  // Lane filter: match on classification laneTypeKey
  if (params.lane) {
    conditions.push(eq(classifications.laneTypeKey, params.lane));
  }

  if (params.actorTrack) {
    conditions.push(eq(classifications.actorTrack, params.actorTrack));
  }

  if (params.journeyStep) {
    conditions.push(eq(classifications.journeyStep, params.journeyStep));
  }

  if (params.tableRow) {
    conditions.push(eq(widgets.rowId, params.tableRow));
  }

  if (params.tableColumn) {
    conditions.push(eq(widgets.columnId, params.tableColumn));
  }

  if (params.placement === "unplaced") {
    const unplacedCondition = or(
      isNull(widgets.rowIndex),
      isNull(widgets.columnIndex),
    );
    if (unplacedCondition) {
      conditions.push(unplacedCondition);
    }
  }

  if (params.triage === "open") {
    conditions.push(isNull(widgetTriage.id));
  } else if (params.triage) {
    conditions.push(eq(widgetTriage.state, params.triage));
  }

  return conditions;
}

type AxisOption = {
  value: string;
  label: string;
  index: number;
  tableLabel: string;
  tableMuralWidgetId: string;
};

type AxisOptions = {
  rows: AxisOption[];
  columns: AxisOption[];
};

type AxisLookupEntry = {
  label: string;
  tableLabel: string;
};

type AxisLookup = {
  rows: Map<string, AxisLookupEntry>;
  columns: Map<string, AxisLookupEntry>;
};

function buildAxisOptions(
  tableWidgets: Array<{ muralWidgetId: string; metadata: WidgetMetadata }>,
): AxisOptions {
  const tableCount = tableWidgets.length;
  const rows: AxisOption[] = [];
  const columns: AxisOption[] = [];

  tableWidgets.forEach((table, tableIndex) => {
    const tableLabel = `Tabell ${tableIndex + 1}`;
    rows.push(
      ...toAxisOptions({
        entries: table.metadata.tableRows ?? [],
        fallbackPrefix: "Rad",
        tableLabel,
        tableMuralWidgetId: table.muralWidgetId,
        includeTableContext: tableCount > 1,
      }),
    );
    columns.push(
      ...toAxisOptions({
        entries: table.metadata.tableColumns ?? [],
        fallbackPrefix: "Kolonne",
        tableLabel,
        tableMuralWidgetId: table.muralWidgetId,
        includeTableContext: tableCount > 1,
      }),
    );
  });

  return {
    rows: rows.sort(compareAxisOptions),
    columns: columns.sort(compareAxisOptions),
  };
}

function toAxisOptions({
  entries,
  fallbackPrefix,
  tableLabel,
  tableMuralWidgetId,
  includeTableContext,
}: {
  entries: NonNullable<WidgetMetadata["tableRows"]>;
  fallbackPrefix: "Rad" | "Kolonne";
  tableLabel: string;
  tableMuralWidgetId: string;
  includeTableContext: boolean;
}): AxisOption[] {
  return entries.map((entry) => {
    const baseLabel =
      entry.label?.trim() || `${fallbackPrefix} ${entry.index + 1}`;
    return {
      value: entry.id,
      label: includeTableContext ? `${baseLabel} (${tableLabel})` : baseLabel,
      index: entry.index,
      tableLabel,
      tableMuralWidgetId,
    };
  });
}

function compareAxisOptions(a: AxisOption, b: AxisOption) {
  return (
    a.tableLabel.localeCompare(b.tableLabel, "nb-NO") ||
    a.index - b.index ||
    a.label.localeCompare(b.label, "nb-NO")
  );
}

function buildAxisLookup(axisOptions: AxisOptions): AxisLookup {
  return {
    rows: new Map(
      axisOptions.rows.map((option) => [
        option.value,
        { label: option.label, tableLabel: option.tableLabel },
      ]),
    ),
    columns: new Map(
      axisOptions.columns.map((option) => [
        option.value,
        { label: option.label, tableLabel: option.tableLabel },
      ]),
    ),
  };
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, (c) => `\\${c}`);
}

function formatWidgetItem(
  row: {
    id: string;
    muralWidgetId: string;
    widgetType: string;
    textContent: string;
    backgroundColor: string | null;
    rowIndex: number | null;
    columnIndex: number | null;
    rowId: string | null;
    columnId: string | null;
    x: number;
    y: number;
    width: number;
    height: number;
    createdAt: Date;
    classificationId: string | null;
    laneTypeKey: string | null;
    laneTypeLabel: string | null;
    classificationVersion: number | null;
    classificationScenario: string | null;
    classificationActorTrack: string | null;
    classificationJourneyStep: string | null;
    classificationJourneyIndex: number | null;
    classificationStatus: string | null;
    triageState: string | null;
    triageReason: string | null;
  },
  axisLookup: AxisLookup,
) {
  const rowAxis = row.rowId ? axisLookup.rows.get(row.rowId) : undefined;
  const columnAxis = row.columnId
    ? axisLookup.columns.get(row.columnId)
    : undefined;

  return {
    id: row.id,
    muralWidgetId: row.muralWidgetId,
    widgetType: row.widgetType,
    textContent: truncateText(row.textContent, 200),
    backgroundColor: row.backgroundColor,
    rowIndex: row.rowIndex,
    columnIndex: row.columnIndex,
    position: { x: row.x, y: row.y, width: row.width, height: row.height },
    tablePosition: {
      rowLabel: rowAxis?.label ?? null,
      columnLabel: columnAxis?.label ?? null,
      tableLabel: rowAxis?.tableLabel ?? columnAxis?.tableLabel ?? null,
    },
    classification: row.classificationId
      ? {
          laneTypeKey: row.laneTypeKey,
          laneTypeLabel: row.laneTypeLabel,
          version: row.classificationVersion,
          scenario: row.classificationScenario,
          actorTrack: row.classificationActorTrack,
          journeyStep: row.classificationJourneyStep,
          journeyIndex: row.classificationJourneyIndex,
          status: row.classificationStatus,
        }
      : null,
    triage: {
      state: row.triageState ?? "open",
      reason: row.triageReason,
    },
    createdAt: row.createdAt,
  };
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
