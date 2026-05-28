import { sql } from "drizzle-orm";
import {
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ProjectLaneType = {
  key: string;
  label: string;
  order: number;
  description?: string | null;
  colorToken?: string | null;
  metadata?: Record<string, JsonValue>;
};

export type WidgetAxisMetadata = {
  id: string;
  index: number;
  label?: string | null;
};

export type WidgetMetadata = {
  tableColumns?: WidgetAxisMetadata[];
  tableRows?: WidgetAxisMetadata[];
};

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

const versionColumn = integer("version").default(1).notNull();

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    sourceSystem: text("source_system"),
    sourceId: text("source_id"),
    laneTypes: jsonb("lane_types")
      .$type<ProjectLaneType[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    createdBy: text("created_by").notNull(),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    version: versionColumn,
  },
  (table) => [
    uniqueIndex("projects_source_system_source_id_key").on(
      table.sourceSystem,
      table.sourceId,
    ),
    check(
      "projects_lane_types_is_array",
      sql`jsonb_typeof(${table.laneTypes}) = 'array'`,
    ),
    check("projects_version_positive", sql`${table.version} > 0`),
  ],
);

export const muralImports = pgTable(
  "mural_imports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    sourceDescription: text("source_description").notNull(),
    receivedWidgetCount: integer("received_widget_count").notNull().default(0),
    storedWidgetCount: integer("stored_widget_count").notNull().default(0),
    skippedWidgetCount: integer("skipped_widget_count").notNull().default(0),
    classificationCount: integer("classification_count").notNull().default(0),
    errorCode: text("error_code"),
    errorSummary: text("error_summary"),
    createdBy: text("created_by").notNull(),
    ...timestamps,
    completedAt: timestamp("completed_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    version: versionColumn,
  },
  (table) => [
    index("mural_imports_project_status_idx").on(table.projectId, table.status),
    check(
      "mural_imports_status_check",
      sql`${table.status} in ('pending', 'processing', 'completed', 'failed')`,
    ),
    check(
      "mural_imports_received_widget_count_non_negative",
      sql`${table.receivedWidgetCount} >= 0`,
    ),
    check(
      "mural_imports_stored_widget_count_non_negative",
      sql`${table.storedWidgetCount} >= 0`,
    ),
    check(
      "mural_imports_skipped_widget_count_non_negative",
      sql`${table.skippedWidgetCount} >= 0`,
    ),
    check(
      "mural_imports_classification_count_non_negative",
      sql`${table.classificationCount} >= 0`,
    ),
    check("mural_imports_version_positive", sql`${table.version} > 0`),
  ],
);

export const widgets = pgTable(
  "widgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    importId: uuid("import_id")
      .notNull()
      .references(() => muralImports.id, { onDelete: "cascade" }),
    muralWidgetId: text("mural_widget_id").notNull(),
    widgetType: text("widget_type").notNull(),
    parentMuralWidgetId: text("parent_mural_widget_id"),
    rowId: text("row_id"),
    columnId: text("column_id"),
    rowIndex: integer("row_index"),
    columnIndex: integer("column_index"),
    x: doublePrecision("x").notNull(),
    y: doublePrecision("y").notNull(),
    width: doublePrecision("width").notNull(),
    height: doublePrecision("height").notNull(),
    stackingOrder: integer("stacking_order"),
    textContent: text("text_content").notNull().default(""),
    backgroundColor: text("background_color"),
    metadata: jsonb("metadata")
      .$type<WidgetMetadata>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    ...timestamps,
    version: versionColumn,
  },
  (table) => [
    uniqueIndex("widgets_project_import_mural_widget_id_key").on(
      table.projectId,
      table.importId,
      table.muralWidgetId,
    ),
    index("widgets_project_id_idx").on(table.projectId),
    index("widgets_project_widget_type_idx").on(
      table.projectId,
      table.widgetType,
    ),
    index("widgets_project_row_column_idx").on(
      table.projectId,
      table.rowIndex,
      table.columnIndex,
    ),
    index("widgets_text_content_trgm_idx").using(
      "gin",
      table.textContent.op("gin_trgm_ops"),
    ),
    check(
      "widgets_metadata_is_object",
      sql`jsonb_typeof(${table.metadata}) = 'object'`,
    ),
    check("widgets_width_non_negative", sql`${table.width} >= 0`),
    check("widgets_height_non_negative", sql`${table.height} >= 0`),
    check("widgets_version_positive", sql`${table.version} > 0`),
  ],
);

export const classifications = pgTable(
  "classifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    widgetId: uuid("widget_id")
      .notNull()
      .references(() => widgets.id, { onDelete: "cascade" }),
    laneTypeKey: text("lane_type_key").notNull(),
    laneTypeLabel: text("lane_type_label").notNull(),
    scenario: text("scenario"),
    actorTrack: text("actor_track"),
    journeyStep: text("journey_step"),
    journeyIndex: integer("journey_index"),
    notes: text("notes"),
    status: text("status").notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    ...timestamps,
    version: versionColumn,
  },
  (table) => [
    uniqueIndex("classifications_widget_id_key").on(table.widgetId),
    index("classifications_project_widget_idx").on(
      table.projectId,
      table.widgetId,
    ),
    check("classifications_version_positive", sql`${table.version} > 0`),
  ],
);

export const clusters = pgTable(
  "clusters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    summary: text("summary"),
    status: text("status").notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    ...timestamps,
    version: versionColumn,
  },
  (table) => [
    index("clusters_project_status_idx").on(table.projectId, table.status),
    check(
      "clusters_status_check",
      sql`${table.status} in ('draft', 'validated')`,
    ),
    check("clusters_version_positive", sql`${table.version} > 0`),
  ],
);

export const clusterMemberships = pgTable(
  "cluster_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clusterId: uuid("cluster_id")
      .notNull()
      .references(() => clusters.id, { onDelete: "cascade" }),
    widgetId: uuid("widget_id")
      .notNull()
      .references(() => widgets.id, { onDelete: "cascade" }),
    ...timestamps,
    version: versionColumn,
  },
  (table) => [
    uniqueIndex("cluster_memberships_cluster_widget_id_key").on(
      table.clusterId,
      table.widgetId,
    ),
    index("cluster_memberships_widget_id_idx").on(table.widgetId),
    check("cluster_memberships_version_positive", sql`${table.version} > 0`),
  ],
);

export const interventionCandidates = pgTable(
  "intervention_candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: text("status").notNull().default("proposed"),
    desiredBehavior: text("desired_behavior"),
    rationale: text("rationale").notNull(),
    actorTrack: text("actor_track"),
    journeyStep: text("journey_step"),
    placementRole: text("placement_role"),
    piiConfirmedBy: text("pii_confirmed_by").notNull(),
    piiConfirmedAt: timestamp("pii_confirmed_at", {
      withTimezone: true,
    }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    ...timestamps,
    version: versionColumn,
  },
  (table) => [
    index("intervention_candidates_project_status_idx").on(
      table.projectId,
      table.status,
    ),
    check(
      "intervention_candidates_status_check",
      sql`${table.status} in ('proposed', 'needs_clarification', 'assessed_relevant', 'ready_for_package', 'parked', 'rejected')`,
    ),
    check(
      "intervention_candidates_placement_role_check",
      sql`${table.placementRole} is null or ${table.placementRole} in ('journey_step', 'cross_cutting_support', 'package_support', 'clarification', 'context')`,
    ),
    check(
      "intervention_candidates_title_length",
      sql`char_length(${table.title}) <= 200`,
    ),
    check(
      "intervention_candidates_rationale_length",
      sql`char_length(${table.rationale}) <= 1000`,
    ),
    check(
      "intervention_candidates_desired_behavior_length",
      sql`${table.desiredBehavior} is null or char_length(${table.desiredBehavior}) <= 2000`,
    ),
    check(
      "intervention_candidates_actor_track_length",
      sql`${table.actorTrack} is null or char_length(${table.actorTrack}) <= 200`,
    ),
    check(
      "intervention_candidates_journey_step_length",
      sql`${table.journeyStep} is null or char_length(${table.journeyStep}) <= 200`,
    ),
    check("intervention_candidates_version_positive", sql`${table.version} > 0`),
  ],
);

export const interventionCandidateSources = pgTable(
  "intervention_candidate_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => interventionCandidates.id, { onDelete: "cascade" }),
    widgetId: uuid("widget_id")
      .notNull()
      .references(() => widgets.id, { onDelete: "cascade" }),
    muralWidgetId: text("mural_widget_id").notNull(),
    piiRisk: text("pii_risk").notNull().default("none"),
    sanitizedExcerpt: text("sanitized_excerpt"),
    relevanceNote: text("relevance_note"),
    ...timestamps,
    version: versionColumn,
  },
  (table) => [
    uniqueIndex("intervention_candidate_sources_candidate_widget_key").on(
      table.candidateId,
      table.widgetId,
    ),
    index("intervention_candidate_sources_widget_id_idx").on(table.widgetId),
    check(
      "intervention_candidate_sources_pii_risk_check",
      sql`${table.piiRisk} in ('none', 'possible', 'probable')`,
    ),
    check(
      "intervention_candidate_sources_sanitized_excerpt_length",
      sql`${table.sanitizedExcerpt} is null or char_length(${table.sanitizedExcerpt}) <= 500`,
    ),
    check(
      "intervention_candidate_sources_relevance_note_length",
      sql`${table.relevanceNote} is null or char_length(${table.relevanceNote}) <= 500`,
    ),
    check(
      "intervention_candidate_sources_version_positive",
      sql`${table.version} > 0`,
    ),
  ],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type MuralImport = typeof muralImports.$inferSelect;
export type NewMuralImport = typeof muralImports.$inferInsert;

export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;

export type Classification = typeof classifications.$inferSelect;
export type NewClassification = typeof classifications.$inferInsert;

export type Cluster = typeof clusters.$inferSelect;
export type NewCluster = typeof clusters.$inferInsert;

export type ClusterMembership = typeof clusterMemberships.$inferSelect;
export type NewClusterMembership = typeof clusterMemberships.$inferInsert;

export type InterventionCandidate = typeof interventionCandidates.$inferSelect;
export type NewInterventionCandidate =
  typeof interventionCandidates.$inferInsert;

export type InterventionCandidateSource =
  typeof interventionCandidateSources.$inferSelect;
export type NewInterventionCandidateSource =
  typeof interventionCandidateSources.$inferInsert;
