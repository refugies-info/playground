
  create table "public"."content_flows" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "rco_record_id" uuid not null,
    "ingestion_record_id" uuid,
    "editorial_record_id" uuid,
    "progress" text not null,
    "status" text not null
      );


alter table "public"."content_flows" enable row level security;


  create table "public"."editorial_records" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "ingestion_record_id" uuid not null,
    "markdown" text,
    "metadata" jsonb,
    "content_report_id" uuid,
    "metadata_report_id" uuid
      );


alter table "public"."editorial_records" enable row level security;


  create table "public"."ingestion_records" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "markdown" text not null,
    "metadata" jsonb not null,
    "rco_record_id" uuid not null,
    "compliance_report_id" uuid,
    "duplicates_report_id" uuid
      );


alter table "public"."ingestion_records" enable row level security;


  create table "public"."letta_reports" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "report_type" text not null,
    "markdown" text not null,
    "metadata" jsonb not null,
    "agent_id" text not null,
    "rationale" text
      );


alter table "public"."letta_reports" enable row level security;


  create table "public"."rco_records" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "training_offer_id" text not null,
    "training_action_id" text not null,
    "source_created_at" timestamp with time zone not null,
    "source_updated_at" timestamp with time zone not null,
    "source_raw" text not null,
    "metadata" jsonb not null
      );


alter table "public"."rco_records" enable row level security;


  create table "public"."vercel_workflows" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "pipeline_id" uuid not null,
    "workflow_id" text
      );


alter table "public"."vercel_workflows" enable row level security;

CREATE INDEX editorial_records_metadata_path_ops_idx ON public.editorial_records USING gin (metadata jsonb_path_ops);

CREATE UNIQUE INDEX editorial_records_pkey ON public.editorial_records USING btree (id);

CREATE INDEX ingestion_records_metadata_path_ops_idx ON public.ingestion_records USING gin (metadata jsonb_path_ops);

CREATE INDEX letta_reports_metadata_path_ops_idx ON public.letta_reports USING gin (metadata jsonb_path_ops);

CREATE INDEX rco_records_metadata_idx ON public.rco_records USING gin (metadata);

CREATE UNIQUE INDEX rco_records_pkey ON public.rco_records USING btree (id);

CREATE INDEX rco_records_source_updated_at_idx ON public.rco_records USING btree (source_updated_at);

CREATE INDEX rco_records_training_action_id_idx ON public.rco_records USING btree (training_action_id);

CREATE INDEX rco_records_training_offer_id_idx ON public.rco_records USING btree (training_offer_id);

CREATE INDEX rco_records_updated_at_idx ON public.rco_records USING btree (updated_at);

CREATE UNIQUE INDEX rco_ingestion_records_pkey ON public.ingestion_records USING btree (id);

CREATE INDEX rco_ingestion_records_updated_at_idx ON public.ingestion_records USING btree (updated_at);

CREATE UNIQUE INDEX reports_pkey ON public.letta_reports USING btree (id);

CREATE UNIQUE INDEX status_pkey ON public.content_flows USING btree (id);

CREATE UNIQUE INDEX workflows_workflow_id_key ON public.vercel_workflows USING btree (workflow_id);

alter table "public"."content_flows" add constraint "status_pkey" PRIMARY KEY using index "status_pkey";

alter table "public"."editorial_records" add constraint "editorial_records_pkey" PRIMARY KEY using index "editorial_records_pkey";

alter table "public"."ingestion_records" add constraint "rco_ingestion_records_pkey" PRIMARY KEY using index "rco_ingestion_records_pkey";

alter table "public"."letta_reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."rco_records" add constraint "rco_records_pkey" PRIMARY KEY using index "rco_records_pkey";

alter table "public"."content_flows" add constraint "status_editorial_record_id_fkey" FOREIGN KEY (editorial_record_id) REFERENCES public.editorial_records(id) ON UPDATE CASCADE not valid;

alter table "public"."content_flows" validate constraint "status_editorial_record_id_fkey";

alter table "public"."content_flows" add constraint "status_ingestion_record_id_fkey" FOREIGN KEY (ingestion_record_id) REFERENCES public.ingestion_records(id) ON UPDATE CASCADE not valid;

alter table "public"."content_flows" validate constraint "status_ingestion_record_id_fkey";

alter table "public"."content_flows" add constraint "status_rco_record_id_fkey" FOREIGN KEY (rco_record_id) REFERENCES public.rco_records(id) ON UPDATE CASCADE not valid;

alter table "public"."content_flows" validate constraint "status_rco_record_id_fkey";

alter table "public"."editorial_records" add constraint "editorial_records_content_report_id_fkey" FOREIGN KEY (content_report_id) REFERENCES public.letta_reports(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_content_report_id_fkey";

alter table "public"."editorial_records" add constraint "editorial_records_ingestion_record_id_fkey" FOREIGN KEY (ingestion_record_id) REFERENCES public.ingestion_records(id) not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_ingestion_record_id_fkey";

alter table "public"."editorial_records" add constraint "editorial_records_metadata_report_id_fkey" FOREIGN KEY (metadata_report_id) REFERENCES public.letta_reports(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_metadata_report_id_fkey";

alter table "public"."editorial_records" add constraint "editorial_records_rco_ingestion_record_id_fkey" FOREIGN KEY (ingestion_record_id) REFERENCES public.ingestion_records(id) not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_rco_ingestion_record_id_fkey";

alter table "public"."ingestion_records" add constraint "ingestion_records_compliance_report_id_fkey" FOREIGN KEY (compliance_report_id) REFERENCES public.letta_reports(id) not valid;

alter table "public"."ingestion_records" validate constraint "ingestion_records_compliance_report_id_fkey";

alter table "public"."ingestion_records" add constraint "ingestion_records_duplicates_report_id_fkey" FOREIGN KEY (duplicates_report_id) REFERENCES public.letta_reports(id) not valid;

alter table "public"."ingestion_records" validate constraint "ingestion_records_duplicates_report_id_fkey";

alter table "public"."ingestion_records" add constraint "ingestion_records_rco_record_id_fkey" FOREIGN KEY (rco_record_id) REFERENCES public.rco_records(id) not valid;

alter table "public"."ingestion_records" validate constraint "ingestion_records_rco_record_id_fkey";

alter table "public"."vercel_workflows" add constraint "workflows_pipeline_id_fkey" FOREIGN KEY (pipeline_id) REFERENCES public.content_flows(id) ON UPDATE CASCADE not valid;

alter table "public"."vercel_workflows" validate constraint "workflows_pipeline_id_fkey";

alter table "public"."vercel_workflows" add constraint "workflows_workflow_id_key" UNIQUE using index "workflows_workflow_id_key";

grant delete on table "public"."content_flows" to "anon";

grant insert on table "public"."content_flows" to "anon";

grant references on table "public"."content_flows" to "anon";

grant select on table "public"."content_flows" to "anon";

grant trigger on table "public"."content_flows" to "anon";

grant truncate on table "public"."content_flows" to "anon";

grant update on table "public"."content_flows" to "anon";

grant delete on table "public"."content_flows" to "authenticated";

grant insert on table "public"."content_flows" to "authenticated";

grant references on table "public"."content_flows" to "authenticated";

grant select on table "public"."content_flows" to "authenticated";

grant trigger on table "public"."content_flows" to "authenticated";

grant truncate on table "public"."content_flows" to "authenticated";

grant update on table "public"."content_flows" to "authenticated";

grant delete on table "public"."content_flows" to "service_role";

grant insert on table "public"."content_flows" to "service_role";

grant references on table "public"."content_flows" to "service_role";

grant select on table "public"."content_flows" to "service_role";

grant trigger on table "public"."content_flows" to "service_role";

grant truncate on table "public"."content_flows" to "service_role";

grant update on table "public"."content_flows" to "service_role";

grant delete on table "public"."editorial_records" to "anon";

grant insert on table "public"."editorial_records" to "anon";

grant references on table "public"."editorial_records" to "anon";

grant select on table "public"."editorial_records" to "anon";

grant trigger on table "public"."editorial_records" to "anon";

grant truncate on table "public"."editorial_records" to "anon";

grant update on table "public"."editorial_records" to "anon";

grant delete on table "public"."editorial_records" to "authenticated";

grant insert on table "public"."editorial_records" to "authenticated";

grant references on table "public"."editorial_records" to "authenticated";

grant select on table "public"."editorial_records" to "authenticated";

grant trigger on table "public"."editorial_records" to "authenticated";

grant truncate on table "public"."editorial_records" to "authenticated";

grant update on table "public"."editorial_records" to "authenticated";

grant delete on table "public"."editorial_records" to "service_role";

grant insert on table "public"."editorial_records" to "service_role";

grant references on table "public"."editorial_records" to "service_role";

grant select on table "public"."editorial_records" to "service_role";

grant trigger on table "public"."editorial_records" to "service_role";

grant truncate on table "public"."editorial_records" to "service_role";

grant update on table "public"."editorial_records" to "service_role";

grant delete on table "public"."ingestion_records" to "anon";

grant insert on table "public"."ingestion_records" to "anon";

grant references on table "public"."ingestion_records" to "anon";

grant select on table "public"."ingestion_records" to "anon";

grant trigger on table "public"."ingestion_records" to "anon";

grant truncate on table "public"."ingestion_records" to "anon";

grant update on table "public"."ingestion_records" to "anon";

grant delete on table "public"."ingestion_records" to "authenticated";

grant insert on table "public"."ingestion_records" to "authenticated";

grant references on table "public"."ingestion_records" to "authenticated";

grant select on table "public"."ingestion_records" to "authenticated";

grant trigger on table "public"."ingestion_records" to "authenticated";

grant truncate on table "public"."ingestion_records" to "authenticated";

grant update on table "public"."ingestion_records" to "authenticated";

grant delete on table "public"."ingestion_records" to "service_role";

grant insert on table "public"."ingestion_records" to "service_role";

grant references on table "public"."ingestion_records" to "service_role";

grant select on table "public"."ingestion_records" to "service_role";

grant trigger on table "public"."ingestion_records" to "service_role";

grant truncate on table "public"."ingestion_records" to "service_role";

grant update on table "public"."ingestion_records" to "service_role";

grant delete on table "public"."letta_reports" to "anon";

grant insert on table "public"."letta_reports" to "anon";

grant references on table "public"."letta_reports" to "anon";

grant select on table "public"."letta_reports" to "anon";

grant trigger on table "public"."letta_reports" to "anon";

grant truncate on table "public"."letta_reports" to "anon";

grant update on table "public"."letta_reports" to "anon";

grant delete on table "public"."letta_reports" to "authenticated";

grant insert on table "public"."letta_reports" to "authenticated";

grant references on table "public"."letta_reports" to "authenticated";

grant select on table "public"."letta_reports" to "authenticated";

grant trigger on table "public"."letta_reports" to "authenticated";

grant truncate on table "public"."letta_reports" to "authenticated";

grant update on table "public"."letta_reports" to "authenticated";

grant delete on table "public"."letta_reports" to "service_role";

grant insert on table "public"."letta_reports" to "service_role";

grant references on table "public"."letta_reports" to "service_role";

grant select on table "public"."letta_reports" to "service_role";

grant trigger on table "public"."letta_reports" to "service_role";

grant truncate on table "public"."letta_reports" to "service_role";

grant update on table "public"."letta_reports" to "service_role";

grant delete on table "public"."rco_records" to "anon";

grant insert on table "public"."rco_records" to "anon";

grant references on table "public"."rco_records" to "anon";

grant select on table "public"."rco_records" to "anon";

grant trigger on table "public"."rco_records" to "anon";

grant truncate on table "public"."rco_records" to "anon";

grant update on table "public"."rco_records" to "anon";

grant delete on table "public"."rco_records" to "authenticated";

grant insert on table "public"."rco_records" to "authenticated";

grant references on table "public"."rco_records" to "authenticated";

grant select on table "public"."rco_records" to "authenticated";

grant trigger on table "public"."rco_records" to "authenticated";

grant truncate on table "public"."rco_records" to "authenticated";

grant update on table "public"."rco_records" to "authenticated";

grant delete on table "public"."rco_records" to "service_role";

grant insert on table "public"."rco_records" to "service_role";

grant references on table "public"."rco_records" to "service_role";

grant select on table "public"."rco_records" to "service_role";

grant trigger on table "public"."rco_records" to "service_role";

grant truncate on table "public"."rco_records" to "service_role";

grant update on table "public"."rco_records" to "service_role";

grant delete on table "public"."vercel_workflows" to "anon";

grant insert on table "public"."vercel_workflows" to "anon";

grant references on table "public"."vercel_workflows" to "anon";

grant select on table "public"."vercel_workflows" to "anon";

grant trigger on table "public"."vercel_workflows" to "anon";

grant truncate on table "public"."vercel_workflows" to "anon";

grant update on table "public"."vercel_workflows" to "anon";

grant delete on table "public"."vercel_workflows" to "authenticated";

grant insert on table "public"."vercel_workflows" to "authenticated";

grant references on table "public"."vercel_workflows" to "authenticated";

grant select on table "public"."vercel_workflows" to "authenticated";

grant trigger on table "public"."vercel_workflows" to "authenticated";

grant truncate on table "public"."vercel_workflows" to "authenticated";

grant update on table "public"."vercel_workflows" to "authenticated";

grant delete on table "public"."vercel_workflows" to "service_role";

grant insert on table "public"."vercel_workflows" to "service_role";

grant references on table "public"."vercel_workflows" to "service_role";

grant select on table "public"."vercel_workflows" to "service_role";

grant trigger on table "public"."vercel_workflows" to "service_role";

grant truncate on table "public"."vercel_workflows" to "service_role";

grant update on table "public"."vercel_workflows" to "service_role";
