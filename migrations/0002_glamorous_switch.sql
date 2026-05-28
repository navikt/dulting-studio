CREATE TABLE "cluster_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cluster_id" uuid NOT NULL,
	"widget_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "cluster_memberships_version_positive" CHECK ("cluster_memberships"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"summary" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "clusters_status_check" CHECK ("clusters"."status" in ('draft', 'validated')),
	CONSTRAINT "clusters_version_positive" CHECK ("clusters"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "cluster_memberships" ADD CONSTRAINT "cluster_memberships_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cluster_memberships" ADD CONSTRAINT "cluster_memberships_widget_id_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cluster_memberships_cluster_widget_id_key" ON "cluster_memberships" USING btree ("cluster_id","widget_id");--> statement-breakpoint
CREATE INDEX "cluster_memberships_widget_id_idx" ON "cluster_memberships" USING btree ("widget_id");--> statement-breakpoint
CREATE INDEX "clusters_project_status_idx" ON "clusters" USING btree ("project_id","status");