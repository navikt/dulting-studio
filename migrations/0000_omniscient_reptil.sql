CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE TABLE "classifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"widget_id" uuid NOT NULL,
	"lane_type_key" text NOT NULL,
	"lane_type_label" text NOT NULL,
	"scenario" text,
	"actor_track" text,
	"journey_step" text,
	"journey_index" integer,
	"notes" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "classifications_version_positive" CHECK ("classifications"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "mural_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"source_description" text NOT NULL,
	"received_widget_count" integer DEFAULT 0 NOT NULL,
	"stored_widget_count" integer DEFAULT 0 NOT NULL,
	"skipped_widget_count" integer DEFAULT 0 NOT NULL,
	"classification_count" integer DEFAULT 0 NOT NULL,
	"error_code" text,
	"error_summary" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "mural_imports_status_check" CHECK ("mural_imports"."status" in ('pending', 'processing', 'completed', 'failed')),
	CONSTRAINT "mural_imports_received_widget_count_non_negative" CHECK ("mural_imports"."received_widget_count" >= 0),
	CONSTRAINT "mural_imports_stored_widget_count_non_negative" CHECK ("mural_imports"."stored_widget_count" >= 0),
	CONSTRAINT "mural_imports_skipped_widget_count_non_negative" CHECK ("mural_imports"."skipped_widget_count" >= 0),
	CONSTRAINT "mural_imports_classification_count_non_negative" CHECK ("mural_imports"."classification_count" >= 0),
	CONSTRAINT "mural_imports_version_positive" CHECK ("mural_imports"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"source_system" text,
	"source_id" text,
	"lane_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "projects_lane_types_is_array" CHECK (jsonb_typeof("projects"."lane_types") = 'array'),
	CONSTRAINT "projects_version_positive" CHECK ("projects"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"import_id" uuid NOT NULL,
	"mural_widget_id" text NOT NULL,
	"widget_type" text NOT NULL,
	"parent_mural_widget_id" text,
	"row_id" text,
	"column_id" text,
	"row_index" integer,
	"column_index" integer,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"width" double precision NOT NULL,
	"height" double precision NOT NULL,
	"stacking_order" integer,
	"text_content" text DEFAULT '' NOT NULL,
	"background_color" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "widgets_metadata_is_object" CHECK (jsonb_typeof("widgets"."metadata") = 'object'),
	CONSTRAINT "widgets_width_non_negative" CHECK ("widgets"."width" >= 0),
	CONSTRAINT "widgets_height_non_negative" CHECK ("widgets"."height" >= 0),
	CONSTRAINT "widgets_version_positive" CHECK ("widgets"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "classifications" ADD CONSTRAINT "classifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classifications" ADD CONSTRAINT "classifications_widget_id_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mural_imports" ADD CONSTRAINT "mural_imports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_import_id_mural_imports_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."mural_imports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "classifications_widget_id_key" ON "classifications" USING btree ("widget_id");--> statement-breakpoint
CREATE INDEX "classifications_project_widget_idx" ON "classifications" USING btree ("project_id","widget_id");--> statement-breakpoint
CREATE INDEX "mural_imports_project_status_idx" ON "mural_imports" USING btree ("project_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "widgets_project_import_mural_widget_id_key" ON "widgets" USING btree ("project_id","import_id","mural_widget_id");--> statement-breakpoint
CREATE INDEX "widgets_project_id_idx" ON "widgets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "widgets_project_widget_type_idx" ON "widgets" USING btree ("project_id","widget_type");--> statement-breakpoint
CREATE INDEX "widgets_project_row_column_idx" ON "widgets" USING btree ("project_id","row_index","column_index");--> statement-breakpoint
CREATE INDEX "widgets_text_content_trgm_idx" ON "widgets" USING gin ("text_content" gin_trgm_ops);