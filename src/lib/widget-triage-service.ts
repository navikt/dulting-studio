import { and, eq, inArray } from "drizzle-orm";
import type { getDb } from "@/db/client";
import { type NewWidgetTriage, widgets, widgetTriage } from "@/db/schema";
import type { ProtectedApiContext } from "./auth";
import type {
  WidgetTriageRequestBody,
  WidgetTriageState,
} from "./widget-triage-validation";

type Database = ReturnType<typeof getDb>;

export class WidgetTriageWidgetsProjectMismatchError extends Error {
  readonly code = "widget_triage_widgets_project_mismatch";

  constructor() {
    super("Alle widgets må tilhøre prosjektet.");
  }
}

export type WidgetTriageStore = {
  findWidgetsByIds(projectId: string, widgetIds: string[]): Promise<string[]>;
  setWidgetTriage(input: {
    projectId: string;
    widgetIds: string[];
    state: WidgetTriageState;
    reason: string | null;
    updatedBy: string;
  }): Promise<void>;
};

export type SetWidgetTriageResult = {
  widgetIds: string[];
  state: WidgetTriageState;
};

export async function setWidgetTriage(
  store: WidgetTriageStore,
  projectId: string,
  payload: WidgetTriageRequestBody,
  context: ProtectedApiContext,
): Promise<SetWidgetTriageResult> {
  const matchingWidgetIds = await store.findWidgetsByIds(
    projectId,
    payload.widgetIds,
  );

  if (matchingWidgetIds.length !== payload.widgetIds.length) {
    throw new WidgetTriageWidgetsProjectMismatchError();
  }

  await store.setWidgetTriage({
    projectId,
    widgetIds: payload.widgetIds,
    state: payload.state,
    reason: payload.reason,
    updatedBy: context.user.navIdent,
  });

  return {
    widgetIds: payload.widgetIds,
    state: payload.state,
  };
}

export function createDrizzleWidgetTriageStore(
  db: Database,
): WidgetTriageStore {
  return {
    async findWidgetsByIds(projectId, widgetIds) {
      if (widgetIds.length === 0) {
        return [];
      }

      const rows = await db
        .select({ id: widgets.id })
        .from(widgets)
        .where(
          and(eq(widgets.projectId, projectId), inArray(widgets.id, widgetIds)),
        );

      return rows.map((row) => row.id);
    },

    async setWidgetTriage(input) {
      await db.transaction(async (tx) => {
        await tx
          .delete(widgetTriage)
          .where(
            and(
              eq(widgetTriage.projectId, input.projectId),
              inArray(widgetTriage.widgetId, input.widgetIds),
            ),
          );

        if (input.state === "open") {
          return;
        }

        const now = new Date();
        const rows: NewWidgetTriage[] = input.widgetIds.map((widgetId) => ({
          projectId: input.projectId,
          widgetId,
          state: input.state,
          reason: input.reason,
          updatedBy: input.updatedBy,
          createdAt: now,
          updatedAt: now,
        }));

        await tx.insert(widgetTriage).values(rows);
      });
    },
  };
}
