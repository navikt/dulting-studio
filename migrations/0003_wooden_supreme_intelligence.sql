CREATE TABLE "intervention_candidate_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"widget_id" uuid NOT NULL,
	"mural_widget_id" text NOT NULL,
	"pii_risk" text DEFAULT 'none' NOT NULL,
	"sanitized_excerpt" text,
	"relevance_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "intervention_candidate_sources_pii_risk_check" CHECK ("intervention_candidate_sources"."pii_risk" in ('none', 'possible', 'probable')),
	CONSTRAINT "intervention_candidate_sources_sanitized_excerpt_length" CHECK ("intervention_candidate_sources"."sanitized_excerpt" is null or char_length("intervention_candidate_sources"."sanitized_excerpt") <= 500),
	CONSTRAINT "intervention_candidate_sources_relevance_note_length" CHECK ("intervention_candidate_sources"."relevance_note" is null or char_length("intervention_candidate_sources"."relevance_note") <= 500),
	CONSTRAINT "intervention_candidate_sources_version_positive" CHECK ("intervention_candidate_sources"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "intervention_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'proposed' NOT NULL,
	"desired_behavior" text,
	"rationale" text NOT NULL,
	"actor_track" text,
	"journey_step" text,
	"placement_role" text,
	"pii_confirmed_by" text NOT NULL,
	"pii_confirmed_at" timestamp with time zone NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "intervention_candidates_status_check" CHECK ("intervention_candidates"."status" in ('proposed', 'needs_clarification', 'assessed_relevant', 'ready_for_package', 'parked', 'rejected')),
	CONSTRAINT "intervention_candidates_placement_role_check" CHECK ("intervention_candidates"."placement_role" is null or "intervention_candidates"."placement_role" in ('journey_step', 'cross_cutting_support', 'package_support', 'clarification', 'context')),
	CONSTRAINT "intervention_candidates_title_length" CHECK (char_length("intervention_candidates"."title") <= 200),
	CONSTRAINT "intervention_candidates_rationale_length" CHECK (char_length("intervention_candidates"."rationale") <= 1000),
	CONSTRAINT "intervention_candidates_desired_behavior_length" CHECK ("intervention_candidates"."desired_behavior" is null or char_length("intervention_candidates"."desired_behavior") <= 2000),
	CONSTRAINT "intervention_candidates_actor_track_length" CHECK ("intervention_candidates"."actor_track" is null or char_length("intervention_candidates"."actor_track") <= 200),
	CONSTRAINT "intervention_candidates_journey_step_length" CHECK ("intervention_candidates"."journey_step" is null or char_length("intervention_candidates"."journey_step") <= 200),
	CONSTRAINT "intervention_candidates_version_positive" CHECK ("intervention_candidates"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "intervention_candidate_sources" ADD CONSTRAINT "intervention_candidate_sources_candidate_id_intervention_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."intervention_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_candidate_sources" ADD CONSTRAINT "intervention_candidate_sources_widget_id_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_candidates" ADD CONSTRAINT "intervention_candidates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "intervention_candidate_sources_candidate_widget_key" ON "intervention_candidate_sources" USING btree ("candidate_id","widget_id");--> statement-breakpoint
CREATE INDEX "intervention_candidate_sources_widget_id_idx" ON "intervention_candidate_sources" USING btree ("widget_id");--> statement-breakpoint
CREATE INDEX "intervention_candidates_project_status_idx" ON "intervention_candidates" USING btree ("project_id","status");