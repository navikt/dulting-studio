CREATE TABLE "widget_triage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"widget_id" uuid NOT NULL,
	"state" text NOT NULL,
	"reason" text,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "widget_triage_state_check" CHECK ("widget_triage"."state" in ('parked', 'rejected')),
	CONSTRAINT "widget_triage_reason_length" CHECK ("widget_triage"."reason" is null or char_length("widget_triage"."reason") <= 500),
	CONSTRAINT "widget_triage_version_positive" CHECK ("widget_triage"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "widget_triage" ADD CONSTRAINT "widget_triage_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_triage" ADD CONSTRAINT "widget_triage_widget_id_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "widget_triage_widget_id_key" ON "widget_triage" USING btree ("widget_id");--> statement-breakpoint
CREATE INDEX "widget_triage_project_state_idx" ON "widget_triage" USING btree ("project_id","state");