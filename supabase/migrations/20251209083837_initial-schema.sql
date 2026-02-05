
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
    "ingestion_report_id" uuid
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


  create table "public"."workflows" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "rco_record_id" uuid,
    "ingestion_record_id" uuid,
    "editorial_record_id" uuid,
    "progress" text not null,
    "status" text not null,
    "vercel_workflow_id" text,
    "vercel_hook_token" text
      );


alter table "public"."workflows" enable row level security;

CREATE INDEX editorial_records_metadata_path_ops_idx ON public.editorial_records USING gin (metadata jsonb_path_ops);

CREATE UNIQUE INDEX editorial_records_pkey ON public.editorial_records USING btree (id);

CREATE INDEX ingestion_records_metadata_path_ops_idx ON public.ingestion_records USING gin (metadata jsonb_path_ops);

CREATE INDEX letta_reports_metadata_path_ops_idx ON public.letta_reports USING gin (metadata jsonb_path_ops);

CREATE UNIQUE INDEX rco_ingestion_records_pkey ON public.ingestion_records USING btree (id);

CREATE INDEX rco_ingestion_records_updated_at_idx ON public.ingestion_records USING btree (updated_at);

CREATE INDEX rco_records_metadata_idx ON public.rco_records USING gin (metadata);

CREATE UNIQUE INDEX rco_records_pkey ON public.rco_records USING btree (id);

CREATE INDEX rco_records_source_updated_at_idx ON public.rco_records USING btree (source_updated_at);

CREATE INDEX rco_records_training_action_id_idx ON public.rco_records USING btree (training_action_id);

CREATE INDEX rco_records_training_offer_id_idx ON public.rco_records USING btree (training_offer_id);

CREATE INDEX rco_records_updated_at_idx ON public.rco_records USING btree (updated_at);

CREATE UNIQUE INDEX reports_pkey ON public.letta_reports USING btree (id);

CREATE UNIQUE INDEX status_pkey ON public.workflows USING btree (id);

alter table "public"."editorial_records" add constraint "editorial_records_pkey" PRIMARY KEY using index "editorial_records_pkey";

alter table "public"."ingestion_records" add constraint "rco_ingestion_records_pkey" PRIMARY KEY using index "rco_ingestion_records_pkey";

alter table "public"."letta_reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."rco_records" add constraint "rco_records_pkey" PRIMARY KEY using index "rco_records_pkey";

alter table "public"."workflows" add constraint "status_pkey" PRIMARY KEY using index "status_pkey";

alter table "public"."editorial_records" add constraint "editorial_records_content_report_id_fkey" FOREIGN KEY (content_report_id) REFERENCES public.letta_reports(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_content_report_id_fkey";

alter table "public"."editorial_records" add constraint "editorial_records_ingestion_record_id_fkey" FOREIGN KEY (ingestion_record_id) REFERENCES public.ingestion_records(id) not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_ingestion_record_id_fkey";

alter table "public"."editorial_records" add constraint "editorial_records_metadata_report_id_fkey" FOREIGN KEY (metadata_report_id) REFERENCES public.letta_reports(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_metadata_report_id_fkey";

alter table "public"."editorial_records" add constraint "editorial_records_rco_ingestion_record_id_fkey" FOREIGN KEY (ingestion_record_id) REFERENCES public.ingestion_records(id) not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_rco_ingestion_record_id_fkey";

alter table "public"."ingestion_records" add constraint "ingestion_records_ingestion_report_id_fkey" FOREIGN KEY (ingestion_report_id) REFERENCES public.letta_reports(id) not valid;

alter table "public"."ingestion_records" validate constraint "ingestion_records_ingestion_report_id_fkey";

alter table "public"."ingestion_records" add constraint "ingestion_records_rco_record_id_fkey" FOREIGN KEY (rco_record_id) REFERENCES public.rco_records(id) not valid;

alter table "public"."ingestion_records" validate constraint "ingestion_records_rco_record_id_fkey";

alter table "public"."workflows" add constraint "status_editorial_record_id_fkey" FOREIGN KEY (editorial_record_id) REFERENCES public.editorial_records(id) ON UPDATE CASCADE not valid;

alter table "public"."workflows" validate constraint "status_editorial_record_id_fkey";

alter table "public"."workflows" add constraint "status_ingestion_record_id_fkey" FOREIGN KEY (ingestion_record_id) REFERENCES public.ingestion_records(id) ON UPDATE CASCADE not valid;

alter table "public"."workflows" validate constraint "status_ingestion_record_id_fkey";

alter table "public"."workflows" add constraint "status_rco_record_id_fkey" FOREIGN KEY (rco_record_id) REFERENCES public.rco_records(id) ON UPDATE CASCADE not valid;

alter table "public"."workflows" validate constraint "status_rco_record_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_editorial_record()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Update the content_flow linked to the Ingestion record
  UPDATE public.workflows
  SET
    editorial_record_id = NEW.id,
    progress = 'draft'
  WHERE ingestion_record_id = NEW.ingestion_record_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_ingestion_record()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Update the content_flow linked to the RCO record
  UPDATE public.workflows
  SET
    ingestion_record_id = NEW.id,
    progress = 'to_process'
  WHERE rco_record_id = NEW.rco_record_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_rco_record()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.workflows (rco_record_id, progress, status)
  VALUES (NEW.id, 'to_process', 'unknown');
  RETURN NEW;
END;
$function$
;

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

grant delete on table "public"."workflows" to "anon";

grant insert on table "public"."workflows" to "anon";

grant references on table "public"."workflows" to "anon";

grant select on table "public"."workflows" to "anon";

grant trigger on table "public"."workflows" to "anon";

grant truncate on table "public"."workflows" to "anon";

grant update on table "public"."workflows" to "anon";

grant delete on table "public"."workflows" to "authenticated";

grant insert on table "public"."workflows" to "authenticated";

grant references on table "public"."workflows" to "authenticated";

grant select on table "public"."workflows" to "authenticated";

grant trigger on table "public"."workflows" to "authenticated";

grant truncate on table "public"."workflows" to "authenticated";

grant update on table "public"."workflows" to "authenticated";

grant delete on table "public"."workflows" to "service_role";

grant insert on table "public"."workflows" to "service_role";

grant references on table "public"."workflows" to "service_role";

grant select on table "public"."workflows" to "service_role";

grant trigger on table "public"."workflows" to "service_role";

grant truncate on table "public"."workflows" to "service_role";

grant update on table "public"."workflows" to "service_role";

CREATE TRIGGER on_new_editorial_record AFTER INSERT ON public.editorial_records FOR EACH ROW EXECUTE FUNCTION public.handle_new_editorial_record();

CREATE TRIGGER on_new_ingestion_record AFTER INSERT ON public.ingestion_records FOR EACH ROW EXECUTE FUNCTION public.handle_new_ingestion_record();

CREATE TRIGGER on_new_rco_record AFTER INSERT ON public.rco_records FOR EACH ROW EXECUTE FUNCTION public.handle_new_rco_record();
