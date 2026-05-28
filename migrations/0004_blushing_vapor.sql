CREATE TABLE "intervention_package_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"format" text NOT NULL,
	"exported_by" text NOT NULL,
	"exported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"included_pii_risk_levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_hash" text NOT NULL,
	"call_id" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "intervention_package_exports_format_check" CHECK ("intervention_package_exports"."format" in ('markdown', 'json')),
	CONSTRAINT "intervention_package_exports_pii_risk_levels_array" CHECK (jsonb_typeof("intervention_package_exports"."included_pii_risk_levels") = 'array'),
	CONSTRAINT "intervention_package_exports_version_positive" CHECK ("intervention_package_exports"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "intervention_package_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"assessment" text NOT NULL,
	"forgood_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"open_questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stop_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"added_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "intervention_package_members_assessment_length" CHECK (char_length("intervention_package_members"."assessment") <= 2000),
	CONSTRAINT "intervention_package_members_forgood_flags_array" CHECK (jsonb_typeof("intervention_package_members"."forgood_flags") = 'array'),
	CONSTRAINT "intervention_package_members_open_questions_array" CHECK (jsonb_typeof("intervention_package_members"."open_questions") = 'array'),
	CONSTRAINT "intervention_package_members_stop_criteria_array" CHECK (jsonb_typeof("intervention_package_members"."stop_criteria") = 'array'),
	CONSTRAINT "intervention_package_members_version_positive" CHECK ("intervention_package_members"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "intervention_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"purpose" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "intervention_packages_status_check" CHECK ("intervention_packages"."status" in ('draft', 'exported')),
	CONSTRAINT "intervention_packages_name_length" CHECK (char_length("intervention_packages"."name") <= 200),
	CONSTRAINT "intervention_packages_purpose_length" CHECK ("intervention_packages"."purpose" is null or char_length("intervention_packages"."purpose") <= 2000),
	CONSTRAINT "intervention_packages_version_positive" CHECK ("intervention_packages"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "intervention_package_exports" ADD CONSTRAINT "intervention_package_exports_package_id_intervention_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."intervention_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_package_members" ADD CONSTRAINT "intervention_package_members_package_id_intervention_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."intervention_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_package_members" ADD CONSTRAINT "intervention_package_members_candidate_id_intervention_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."intervention_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention_packages" ADD CONSTRAINT "intervention_packages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "intervention_package_exports_package_id_idx" ON "intervention_package_exports" USING btree ("package_id");--> statement-breakpoint
CREATE UNIQUE INDEX "intervention_package_members_package_candidate_key" ON "intervention_package_members" USING btree ("package_id","candidate_id");--> statement-breakpoint
CREATE INDEX "intervention_package_members_candidate_id_idx" ON "intervention_package_members" USING btree ("candidate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "intervention_packages_project_name_key" ON "intervention_packages" USING btree ("project_id","name");--> statement-breakpoint
CREATE INDEX "intervention_packages_project_status_idx" ON "intervention_packages" USING btree ("project_id","status");