import { and, eq, inArray, isNull } from "drizzle-orm";
import type { getDb } from "@/db/client";
import { muralImports, projects, widgets } from "@/db/schema";

type Database = ReturnType<typeof getDb>;

const DEFAULT_SORT = "importedAt";
const DEFAULT_ORDER = "desc";
const ALLOWED_SORTS = ["name", "importedAt", "widgetCount"] as const;
const ALLOWED_ORDERS = ["asc", "desc"] as const;
const ALLOWED_IMPORT_STATUSES = [
  "completed",
  "failed",
  "processing",
  "pending",
] as const;

type AllowedSort = (typeof ALLOWED_SORTS)[number];
type AllowedOrder = (typeof ALLOWED_ORDERS)[number];
type AllowedImportStatus = (typeof ALLOWED_IMPORT_STATUSES)[number];

export type ProjectListItem = {
  id: string;
  name: string;
  sourceDescription: string | null;
  importedAt: Date | null;
  latestImportStatus: AllowedImportStatus | null;
  widgetCount: number;
};

export type ProjectListQueryParams = {
  sort: AllowedSort;
  order: AllowedOrder;
};

export type ProjectListQueryValidationError = {
  field: "sort" | "order";
  message: string;
};

export type ProjectListProjectRecord = {
  id: string;
  name: string;
  sourceSystem: string | null;
  deletedAt: Date | null;
  imports: Array<{
    id: string;
    status: AllowedImportStatus | null;
    sourceDescription: string;
    createdAt: Date;
    completedAt: Date | null;
    deletedAt: Date | null;
  }>;
  widgets: Array<{
    importId: string;
    muralWidgetId: string;
  }>;
};

export type ProjectListStore = {
  fetchProjects(): Promise<ProjectListProjectRecord[]>;
};

export type ProjectListQueryParseResult =
  | { ok: true; params: ProjectListQueryParams }
  | { ok: false; errors: ProjectListQueryValidationError[] };

export function parseProjectListQueryParams(
  searchParams: URLSearchParams,
): ProjectListQueryParseResult {
  const errors: ProjectListQueryValidationError[] = [];
  const sortParam = searchParams.get("sort");
  const orderParam = searchParams.get("order");

  const sort = sortParam ?? DEFAULT_SORT;
  const order = orderParam ?? DEFAULT_ORDER;

  if (!ALLOWED_SORTS.includes(sort as AllowedSort)) {
    errors.push({
      field: "sort",
      message: `Må være en av: ${ALLOWED_SORTS.join(", ")}`,
    });
  }

  if (!ALLOWED_ORDERS.includes(order as AllowedOrder)) {
    errors.push({
      field: "order",
      message: "Må være 'asc' eller 'desc'",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    params: {
      sort: sort as AllowedSort,
      order: order as AllowedOrder,
    },
  };
}

export async function listProjects(
  store: ProjectListStore,
  params: ProjectListQueryParams,
): Promise<ProjectListItem[]> {
  const projects = await store.fetchProjects();

  return projects
    .filter(isRelevantImportedMuralProject)
    .map(toProjectListItem)
    .sort((left, right) => compareProjectListItems(left, right, params));
}

function isRelevantImportedMuralProject(project: ProjectListProjectRecord) {
  return (
    project.sourceSystem === "mural" &&
    project.deletedAt === null &&
    getActiveImports(project).length > 0
  );
}

function toProjectListItem(project: ProjectListProjectRecord): ProjectListItem {
  const activeImports = getActiveImports(project);
  const latestImport = getLatestImport(activeImports);
  const latestCompletedImport = getLatestCompletedImport(activeImports);
  const activeImportIds = new Set(activeImports.map((item) => item.id));
  const widgetIds = new Set(
    project.widgets
      .filter((widget) => activeImportIds.has(widget.importId))
      .map((widget) => widget.muralWidgetId),
  );

  return {
    id: project.id,
    name: project.name,
    sourceDescription: latestImport?.sourceDescription ?? null,
    importedAt: latestCompletedImport?.completedAt ?? null,
    latestImportStatus: latestImport?.status ?? null,
    widgetCount: widgetIds.size,
  };
}

function getActiveImports(project: ProjectListProjectRecord) {
  return project.imports.filter((item) => item.deletedAt === null);
}

function getLatestImport(imports: ProjectListProjectRecord["imports"]) {
  return [...imports].sort(compareLatestImportFirst)[0] ?? null;
}

function getLatestCompletedImport(
  imports: ProjectListProjectRecord["imports"],
) {
  return (
    [...imports]
      .filter(
        (item) => item.status === "completed" && item.completedAt !== null,
      )
      .sort(compareLatestCompletedImportFirst)[0] ?? null
  );
}

function compareLatestImportFirst(
  left: ProjectListProjectRecord["imports"][number],
  right: ProjectListProjectRecord["imports"][number],
) {
  return (
    right.createdAt.getTime() - left.createdAt.getTime() ||
    right.id.localeCompare(left.id, "nb")
  );
}

function compareLatestCompletedImportFirst(
  left: ProjectListProjectRecord["imports"][number],
  right: ProjectListProjectRecord["imports"][number],
) {
  return (
    (right.completedAt?.getTime() ?? 0) - (left.completedAt?.getTime() ?? 0) ||
    right.createdAt.getTime() - left.createdAt.getTime() ||
    right.id.localeCompare(left.id, "nb")
  );
}

function compareProjectListItems(
  left: ProjectListItem,
  right: ProjectListItem,
  params: ProjectListQueryParams,
) {
  if (params.sort === "name") {
    return (
      compareText(left.name, right.name, params.order) ||
      compareText(left.id, right.id, "asc")
    );
  }

  if (params.sort === "widgetCount") {
    return (
      compareNumber(left.widgetCount, right.widgetCount, params.order) ||
      compareText(left.name, right.name, "asc") ||
      compareText(left.id, right.id, "asc")
    );
  }

  return (
    compareNullableDate(left.importedAt, right.importedAt, params.order) ||
    compareText(left.name, right.name, "asc") ||
    compareText(left.id, right.id, "asc")
  );
}

function compareText(left: string, right: string, order: AllowedOrder) {
  const value =
    left.localeCompare(right, "nb", {
      sensitivity: "base",
    }) || left.localeCompare(right, "nb");

  return order === "asc" ? value : value * -1;
}

function compareNumber(left: number, right: number, order: AllowedOrder) {
  const value = left - right;
  return order === "asc" ? value : value * -1;
}

function compareNullableDate(
  left: Date | null,
  right: Date | null,
  order: AllowedOrder,
) {
  // Keep projects without a completed import last in both directions so
  // in-progress/failed imports do not outrank projects with an actual import date.
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  const value = left.getTime() - right.getTime();
  return order === "asc" ? value : value * -1;
}

export function createDrizzleProjectListStore(db: Database): ProjectListStore {
  return {
    async fetchProjects() {
      const projectRows = await db
        .select({
          id: projects.id,
          name: projects.name,
          sourceSystem: projects.sourceSystem,
          deletedAt: projects.deletedAt,
        })
        .from(projects)
        .where(
          and(eq(projects.sourceSystem, "mural"), isNull(projects.deletedAt)),
        );

      if (projectRows.length === 0) {
        return [];
      }

      const projectIds = projectRows.map((project) => project.id);

      const importRows = await db
        .select({
          id: muralImports.id,
          projectId: muralImports.projectId,
          status: muralImports.status,
          sourceDescription: muralImports.sourceDescription,
          createdAt: muralImports.createdAt,
          completedAt: muralImports.completedAt,
          deletedAt: muralImports.deletedAt,
        })
        .from(muralImports)
        .where(inArray(muralImports.projectId, projectIds));

      const widgetRows = await db
        .select({
          projectId: widgets.projectId,
          importId: widgets.importId,
          muralWidgetId: widgets.muralWidgetId,
        })
        .from(widgets)
        .where(inArray(widgets.projectId, projectIds));

      return projectRows.map((project) => ({
        ...project,
        imports: importRows
          .filter((item) => eqValues(item.projectId, project.id))
          .map((item) => ({
            id: item.id,
            status: toAllowedImportStatus(item.status),
            sourceDescription: item.sourceDescription,
            createdAt: item.createdAt,
            completedAt: item.completedAt,
            deletedAt: item.deletedAt,
          })),
        widgets: widgetRows
          .filter((item) => eqValues(item.projectId, project.id))
          .map((item) => ({
            importId: item.importId,
            muralWidgetId: item.muralWidgetId,
          })),
      }));
    },
  };
}

function eqValues(left: string, right: string) {
  return left === right;
}

function toAllowedImportStatus(status: string): AllowedImportStatus | null {
  if (ALLOWED_IMPORT_STATUSES.includes(status as AllowedImportStatus)) {
    return status as AllowedImportStatus;
  }

  return null;
}
