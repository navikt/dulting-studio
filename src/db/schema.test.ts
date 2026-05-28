import { getTableColumns } from "drizzle-orm";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  classifications,
  clusterMemberships,
  clusters,
  muralImports,
  type NewClassification,
  type NewCluster,
  type NewProject,
  type NewWidget,
  type ProjectLaneType,
  projects,
  widgets,
} from "./schema";

describe("database schema", () => {
  it("defines the core phase 1.2 tables and columns", () => {
    expect(Object.keys(getTableColumns(projects))).toEqual(
      expect.arrayContaining([
        "id",
        "name",
        "description",
        "sourceSystem",
        "sourceId",
        "laneTypes",
        "createdBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "version",
      ]),
    );

    expect(Object.keys(getTableColumns(muralImports))).toEqual(
      expect.arrayContaining([
        "projectId",
        "status",
        "sourceDescription",
        "receivedWidgetCount",
        "storedWidgetCount",
        "skippedWidgetCount",
        "classificationCount",
        "errorCode",
        "errorSummary",
        "createdBy",
        "completedAt",
        "deletedAt",
        "version",
      ]),
    );

    expect(Object.keys(getTableColumns(widgets))).toEqual(
      expect.arrayContaining([
        "projectId",
        "importId",
        "muralWidgetId",
        "widgetType",
        "parentMuralWidgetId",
        "rowId",
        "columnId",
        "rowIndex",
        "columnIndex",
        "x",
        "y",
        "width",
        "height",
        "stackingOrder",
        "textContent",
        "backgroundColor",
        "metadata",
        "version",
      ]),
    );

    expect(Object.keys(getTableColumns(classifications))).toEqual(
      expect.arrayContaining([
        "projectId",
        "widgetId",
        "laneTypeKey",
        "laneTypeLabel",
        "scenario",
        "actorTrack",
        "journeyStep",
        "journeyIndex",
        "notes",
        "status",
        "createdBy",
        "updatedBy",
        "version",
      ]),
    );

    expect(Object.keys(getTableColumns(clusters))).toEqual(
      expect.arrayContaining([
        "projectId",
        "name",
        "summary",
        "status",
        "createdBy",
        "updatedBy",
        "createdAt",
        "updatedAt",
        "version",
      ]),
    );

    expect(Object.keys(getTableColumns(clusterMemberships))).toEqual(
      expect.arrayContaining([
        "clusterId",
        "widgetId",
        "createdAt",
        "updatedAt",
        "version",
      ]),
    );
  });

  it("keeps lane types configurable instead of hardcoded enums", () => {
    const projectColumns = getTableColumns(projects);

    expect(projectColumns.laneTypes.getSQLType()).toBe("jsonb");
    expect(projectColumns.sourceId.getSQLType()).toBe("text");

    expectTypeOf<NonNullable<NewProject["laneTypes"]>>().toEqualTypeOf<
      ProjectLaneType[]
    >();
    expectTypeOf<NewClassification["laneTypeKey"]>().toEqualTypeOf<string>();
    expectTypeOf<NewClassification["laneTypeLabel"]>().toEqualTypeOf<string>();
    expectTypeOf<NewCluster["status"]>().toEqualTypeOf<string | undefined>();
  });

  it("keeps widget metadata constrained to dataminimized table structure", () => {
    expectTypeOf<NonNullable<NewWidget["metadata"]>>().toEqualTypeOf<{
      tableColumns?: Array<{
        id: string;
        index: number;
        label?: string | null;
      }>;
      tableRows?: Array<{
        id: string;
        index: number;
        label?: string | null;
      }>;
    }>();
  });
});
