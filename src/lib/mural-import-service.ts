import { and, eq, isNull } from "drizzle-orm";
import type { getDb } from "@/db/client";
import {
  muralImports,
  type NewMuralImport,
  type NewProject,
  type NewWidget,
  projects,
  widgets,
} from "@/db/schema";
import type { ProtectedApiContext } from "./auth";
import {
  type ProjectImportReport,
  type ProjectImportRequest,
  serializeWidgetMetadata,
} from "./mural-import-contract";
import { isUniqueViolation } from "./postgres-error";

type Database = ReturnType<typeof getDb>;

export class DuplicateProjectImportError extends Error {
  readonly code = "duplicate_source_import";

  constructor() {
    super(
      "Denne Mural-kilden er allerede importert i et prosjekt. Reimport støttes ikke i MVP.",
    );
  }
}

export type ProjectImportResult = {
  projectId: string;
  importId: string;
  report: ProjectImportReport;
};

export type ProjectImportStore = {
  findActiveProjectBySource(sourceId: string): Promise<{ id: string } | null>;
  insertProjectImport(input: {
    project: NewProject;
    muralImport: Omit<NewMuralImport, "projectId">;
    widgets: Omit<NewWidget, "projectId" | "importId">[];
  }): Promise<{ projectId: string; importId: string }>;
};

export async function createProjectImport(
  store: ProjectImportStore,
  payload: ProjectImportRequest,
  context: ProtectedApiContext,
): Promise<ProjectImportResult> {
  const existingProject = await store.findActiveProjectBySource(
    payload.sourceId,
  );

  if (existingProject) {
    throw new DuplicateProjectImportError();
  }

  const project: NewProject = {
    name: payload.projectName,
    description: payload.projectDescription ?? null,
    sourceSystem: "mural",
    sourceId: payload.sourceId,
    createdBy: context.user.navIdent,
  };

  const completedAt = new Date();

  const muralImport: Omit<NewMuralImport, "projectId"> = {
    status: "completed",
    sourceDescription: payload.sourceDescription,
    receivedWidgetCount: payload.report.totalWidgets,
    storedWidgetCount: payload.report.includedWidgets,
    skippedWidgetCount: payload.report.droppedWidgets,
    classificationCount: 0,
    createdBy: context.user.navIdent,
    completedAt,
  };

  const widgetRows: Omit<NewWidget, "projectId" | "importId">[] =
    payload.widgets.map((widget) => ({
      muralWidgetId: widget.muralWidgetId,
      widgetType: widget.widgetType,
      parentMuralWidgetId: widget.parentMuralWidgetId ?? null,
      rowId: widget.rowId ?? null,
      columnId: widget.columnId ?? null,
      rowIndex: widget.rowIndex ?? null,
      columnIndex: widget.columnIndex ?? null,
      x: widget.x,
      y: widget.y,
      width: widget.width,
      height: widget.height,
      stackingOrder: widget.stackingOrder ?? null,
      textContent: widget.textContent,
      backgroundColor: widget.backgroundColor ?? null,
      metadata: serializeWidgetMetadata(widget.metadata),
    }));

  try {
    const { projectId, importId } = await store.insertProjectImport({
      project,
      muralImport,
      widgets: widgetRows,
    });

    return {
      projectId,
      importId,
      report: payload.report,
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateProjectImportError();
    }

    throw error;
  }
}

export function createDrizzleProjectImportStore(
  db: Database,
): ProjectImportStore {
  return {
    async findActiveProjectBySource(sourceId) {
      const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(
            eq(projects.sourceSystem, "mural"),
            eq(projects.sourceId, sourceId),
            isNull(projects.deletedAt),
          ),
        )
        .limit(1);

      return project ?? null;
    },

    async insertProjectImport(input) {
      return db.transaction(async (tx) => {
        const [insertedProject] = await tx
          .insert(projects)
          .values(input.project)
          .returning({ id: projects.id });

        const [insertedImport] = await tx
          .insert(muralImports)
          .values({
            ...input.muralImport,
            projectId: insertedProject.id,
          })
          .returning({ id: muralImports.id });

        if (input.widgets.length > 0) {
          await tx.insert(widgets).values(
            input.widgets.map((widget) => ({
              ...widget,
              projectId: insertedProject.id,
              importId: insertedImport.id,
            })),
          );
        }

        return {
          projectId: insertedProject.id,
          importId: insertedImport.id,
        };
      });
    },
  };
}
